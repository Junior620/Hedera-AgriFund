// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";

/**
 * @title AgriFundLoanContract
 * @dev Smart contract for managing agricultural loans with RWA token collateral
 */
contract AgriFundLoanContract is ReentrancyGuard, Ownable {
    using SafeMath for uint256;

    // Loan status enumeration
    enum LoanStatus {
        PENDING,
        FUNDED,
        REPAID,
        DEFAULTED,
        LIQUIDATED
    }

    // Loan structure
    struct Loan {
        uint256 id;
        address borrower;
        address lender;
        uint256 principal;
        uint256 interestRate; // Basis points (e.g., 850 = 8.5%)
        uint256 duration; // Duration in seconds
        address collateralToken;
        uint256 collateralAmount;
        uint256 ltvRatio; // Loan-to-value ratio in basis points
        uint256 createdAt;
        uint256 fundedAt;
        uint256 dueDate;
        LoanStatus status;
        bool autoLiquidation;
    }

    // State variables
    mapping(uint256 => Loan) public loans;
    mapping(address => uint256[]) public borrowerLoans;
    mapping(address => uint256[]) public lenderLoans;
    mapping(address => bool) public approvedCollateralTokens;
    mapping(address => address) public tokenOracles; // Token to oracle address mapping

    uint256 public nextLoanId;
    uint256 public platformFeeRate; // Basis points
    address public platformFeeRecipient;
    address public stablecoinToken; // USDC or platform stablecoin
    uint256 public maxLtvRatio; // Maximum allowed LTV in basis points
    uint256 public liquidationThreshold; // LTV threshold for liquidation

    // Events
    event LoanCreated(
        uint256 indexed loanId,
        address indexed borrower,
        uint256 principal,
        address collateralToken,
        uint256 collateralAmount
    );

    event LoanFunded(
        uint256 indexed loanId,
        address indexed lender,
        uint256 amount
    );

    event LoanRepaid(
        uint256 indexed loanId,
        uint256 principal,
        uint256 interest
    );

    event LoanDefaulted(
        uint256 indexed loanId,
        address indexed borrower
    );

    event LoanLiquidated(
        uint256 indexed loanId,
        address indexed liquidator,
        uint256 collateralSold
    );

    event CollateralDeposited(
        uint256 indexed loanId,
        address token,
        uint256 amount
    );

    // Modifiers
    modifier onlyBorrower(uint256 _loanId) {
        require(loans[_loanId].borrower == msg.sender, "Only borrower can call this function");
        _;
    }

    modifier onlyLender(uint256 _loanId) {
        require(loans[_loanId].lender == msg.sender, "Only lender can call this function");
        _;
    }

    modifier loanExists(uint256 _loanId) {
        require(_loanId < nextLoanId, "Loan does not exist");
        _;
    }

    modifier validLoanStatus(uint256 _loanId, LoanStatus _status) {
        require(loans[_loanId].status == _status, "Invalid loan status for this operation");
        _;
    }

    constructor(
        address _stablecoinToken,
        uint256 _platformFeeRate,
        address _platformFeeRecipient,
        uint256 _maxLtvRatio,
        uint256 _liquidationThreshold
    ) {
        stablecoinToken = _stablecoinToken;
        platformFeeRate = _platformFeeRate;
        platformFeeRecipient = _platformFeeRecipient;
        maxLtvRatio = _maxLtvRatio; // e.g., 8500 = 85%
        liquidationThreshold = _liquidationThreshold; // e.g., 9000 = 90%
        nextLoanId = 1;
    }

    /**
     * @dev Create a new loan request
     * @param _principal The loan amount requested
     * @param _interestRate Interest rate in basis points
     * @param _duration Loan duration in seconds
     * @param _collateralToken Address of the RWA token used as collateral
     * @param _collateralAmount Amount of collateral tokens
     * @param _autoLiquidation Whether to enable automatic liquidation
     */
    function createLoan(
        uint256 _principal,
        uint256 _interestRate,
        uint256 _duration,
        address _collateralToken,
        uint256 _collateralAmount,
        bool _autoLiquidation
    ) external nonReentrant returns (uint256) {
        require(_principal > 0, "Principal must be greater than 0");
        require(_interestRate > 0 && _interestRate <= 5000, "Interest rate must be between 0.01% and 50%");
        require(_duration >= 86400, "Duration must be at least 1 day"); // 1 day minimum
        require(approvedCollateralTokens[_collateralToken], "Collateral token not approved");
        require(_collateralAmount > 0, "Collateral amount must be greater than 0");

        // Calculate LTV ratio
        uint256 collateralValue = getCollateralValue(_collateralToken, _collateralAmount);
        uint256 ltvRatio = _principal.mul(10000).div(collateralValue);
        require(ltvRatio <= maxLtvRatio, "LTV ratio exceeds maximum allowed");

        uint256 loanId = nextLoanId++;

        // Create loan
        loans[loanId] = Loan({
            id: loanId,
            borrower: msg.sender,
            lender: address(0),
            principal: _principal,
            interestRate: _interestRate,
            duration: _duration,
            collateralToken: _collateralToken,
            collateralAmount: _collateralAmount,
            ltvRatio: ltvRatio,
            createdAt: block.timestamp,
            fundedAt: 0,
            dueDate: 0,
            status: LoanStatus.PENDING,
            autoLiquidation: _autoLiquidation
        });

        borrowerLoans[msg.sender].push(loanId);

        // Transfer collateral to contract
        require(
            IERC20(_collateralToken).transferFrom(msg.sender, address(this), _collateralAmount),
            "Collateral transfer failed"
        );

        emit LoanCreated(loanId, msg.sender, _principal, _collateralToken, _collateralAmount);
        emit CollateralDeposited(loanId, _collateralToken, _collateralAmount);

        return loanId;
    }

    /**
     * @dev Fund a loan
     * @param _loanId The ID of the loan to fund
     */
    function fundLoan(uint256 _loanId)
        external
        nonReentrant
        loanExists(_loanId)
        validLoanStatus(_loanId, LoanStatus.PENDING)
    {
        Loan storage loan = loans[_loanId];
        require(msg.sender != loan.borrower, "Borrower cannot fund their own loan");

        // Calculate platform fee
        uint256 platformFee = loan.principal.mul(platformFeeRate).div(10000);
        uint256 netAmount = loan.principal.sub(platformFee);

        // Transfer stablecoin from lender
        require(
            IERC20(stablecoinToken).transferFrom(msg.sender, loan.borrower, netAmount),
            "Loan funding transfer failed"
        );

        // Transfer platform fee
        if (platformFee > 0) {
            require(
                IERC20(stablecoinToken).transferFrom(msg.sender, platformFeeRecipient, platformFee),
                "Platform fee transfer failed"
            );
        }

        // Update loan details
        loan.lender = msg.sender;
        loan.status = LoanStatus.FUNDED;
        loan.fundedAt = block.timestamp;
        loan.dueDate = block.timestamp.add(loan.duration);

        lenderLoans[msg.sender].push(_loanId);

        emit LoanFunded(_loanId, msg.sender, loan.principal);
    }

    /**
     * @dev Repay a loan
     * @param _loanId The ID of the loan to repay
     */
    function repayLoan(uint256 _loanId)
        external
        nonReentrant
        loanExists(_loanId)
        validLoanStatus(_loanId, LoanStatus.FUNDED)
        onlyBorrower(_loanId)
    {
        Loan storage loan = loans[_loanId];

        // Calculate total repayment amount (principal + interest)
        uint256 interest = calculateInterest(_loanId);
        uint256 totalRepayment = loan.principal.add(interest);

        // Transfer repayment to lender
        require(
            IERC20(stablecoinToken).transferFrom(msg.sender, loan.lender, totalRepayment),
            "Repayment transfer failed"
        );

        // Return collateral to borrower
        require(
            IERC20(loan.collateralToken).transfer(loan.borrower, loan.collateralAmount),
            "Collateral return failed"
        );

        loan.status = LoanStatus.REPAID;

        emit LoanRepaid(_loanId, loan.principal, interest);
    }

    /**
     * @dev Liquidate a defaulted loan
     * @param _loanId The ID of the loan to liquidate
     */
    function liquidateLoan(uint256 _loanId)
        external
        nonReentrant
        loanExists(_loanId)
        validLoanStatus(_loanId, LoanStatus.FUNDED)
    {
        Loan storage loan = loans[_loanId];

        // Check if loan is eligible for liquidation
        require(
            block.timestamp > loan.dueDate ||
            getCurrentLtvRatio(_loanId) >= liquidationThreshold,
            "Loan not eligible for liquidation"
        );

        // Check if caller is authorized (lender or auto-liquidation enabled)
        require(
            msg.sender == loan.lender ||
            (loan.autoLiquidation && msg.sender != loan.borrower),
            "Not authorized to liquidate"
        );

        // Calculate current collateral value
        uint256 collateralValue = getCollateralValue(loan.collateralToken, loan.collateralAmount);
        uint256 outstandingDebt = loan.principal.add(calculateInterest(_loanId));

        if (collateralValue >= outstandingDebt) {
            // Partial liquidation - sell enough collateral to cover debt
            uint256 collateralToSell = outstandingDebt.mul(loan.collateralAmount).div(collateralValue);
            uint256 remainingCollateral = loan.collateralAmount.sub(collateralToSell);

            // Transfer sold collateral value to lender
            require(
                IERC20(loan.collateralToken).transfer(loan.lender, collateralToSell),
                "Liquidation transfer to lender failed"
            );

            // Return remaining collateral to borrower
            if (remainingCollateral > 0) {
                require(
                    IERC20(loan.collateralToken).transfer(loan.borrower, remainingCollateral),
                    "Remaining collateral transfer failed"
                );
            }

            loan.status = LoanStatus.LIQUIDATED;
            emit LoanLiquidated(_loanId, msg.sender, collateralToSell);
        } else {
            // Full liquidation - all collateral to lender
            require(
                IERC20(loan.collateralToken).transfer(loan.lender, loan.collateralAmount),
                "Full liquidation transfer failed"
            );

            loan.status = LoanStatus.DEFAULTED;
            emit LoanDefaulted(_loanId, loan.borrower);
            emit LoanLiquidated(_loanId, msg.sender, loan.collateralAmount);
        }
    }

    /**
     * @dev Calculate interest for a loan
     * @param _loanId The ID of the loan
     * @return The interest amount
     */
    function calculateInterest(uint256 _loanId) public view loanExists(_loanId) returns (uint256) {
        Loan storage loan = loans[_loanId];

        if (loan.status != LoanStatus.FUNDED) {
            return 0;
        }

        uint256 timeElapsed = block.timestamp.sub(loan.fundedAt);
        uint256 yearlyInterest = loan.principal.mul(loan.interestRate).div(10000);
        uint256 interest = yearlyInterest.mul(timeElapsed).div(365 days);

        return interest;
    }

    /**
     * @dev Get current LTV ratio for a loan
     * @param _loanId The ID of the loan
     * @return The current LTV ratio in basis points
     */
    function getCurrentLtvRatio(uint256 _loanId) public view loanExists(_loanId) returns (uint256) {
        Loan storage loan = loans[_loanId];
        uint256 currentCollateralValue = getCollateralValue(loan.collateralToken, loan.collateralAmount);
        uint256 outstandingDebt = loan.principal.add(calculateInterest(_loanId));

        return outstandingDebt.mul(10000).div(currentCollateralValue);
    }

    /**
     * @dev Get collateral value from oracle
     * @param _token The collateral token address
     * @param _amount The amount of tokens
     * @return The USD value of the collateral
     */
    function getCollateralValue(address _token, uint256 _amount) public view returns (uint256) {
        // In a real implementation, this would call a price oracle
        // For demo purposes, we'll use a simple mock calculation

        // Mock prices per token (in USD with 18 decimals)
        // This should be replaced with actual oracle integration
        return _amount.mul(100e18); // $100 per token for demo
    }

    /**
     * @dev Get loan details
     * @param _loanId The ID of the loan
     * @return Loan struct
     */
    function getLoan(uint256 _loanId) external view loanExists(_loanId) returns (Loan memory) {
        return loans[_loanId];
    }

    /**
     * @dev Get loans for a borrower
     * @param _borrower The borrower address
     * @return Array of loan IDs
     */
    function getBorrowerLoans(address _borrower) external view returns (uint256[] memory) {
        return borrowerLoans[_borrower];
    }

    /**
     * @dev Get loans for a lender
     * @param _lender The lender address
     * @return Array of loan IDs
     */
    function getLenderLoans(address _lender) external view returns (uint256[] memory) {
        return lenderLoans[_lender];
    }

    // Admin functions
    function addApprovedCollateralToken(address _token) external onlyOwner {
        approvedCollateralTokens[_token] = true;
    }

    function removeApprovedCollateralToken(address _token) external onlyOwner {
        approvedCollateralTokens[_token] = false;
    }

    function setTokenOracle(address _token, address _oracle) external onlyOwner {
        tokenOracles[_token] = _oracle;
    }

    function setPlatformFeeRate(uint256 _feeRate) external onlyOwner {
        require(_feeRate <= 1000, "Fee rate cannot exceed 10%");
        platformFeeRate = _feeRate;
    }

    function setMaxLtvRatio(uint256 _maxLtv) external onlyOwner {
        require(_maxLtv <= 9500, "Max LTV cannot exceed 95%");
        maxLtvRatio = _maxLtv;
    }

    function setLiquidationThreshold(uint256 _threshold) external onlyOwner {
        require(_threshold <= 10000, "Threshold cannot exceed 100%");
        liquidationThreshold = _threshold;
    }

    // Emergency function to pause contract (if needed)
    function emergencyWithdraw(address _token, uint256 _amount) external onlyOwner {
        require(IERC20(_token).transfer(owner(), _amount), "Emergency withdraw failed");
    }
}
