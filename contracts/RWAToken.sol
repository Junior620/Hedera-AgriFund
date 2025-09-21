// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";

/**
 * @title RWAToken
 * @dev ERC20 token representing Real World Assets (crops, livestock, etc.)
 * Integrates with Hedera Token Service (HTS) for cross-chain compatibility
 */
contract RWAToken is ERC20, ERC20Burnable, Ownable, Pausable {
    using SafeMath for uint256;

    // Asset metadata structure
    struct AssetMetadata {
        string assetType; // e.g., "maize", "coffee", "wheat"
        uint256 quantity; // Physical quantity (e.g., kg, tons)
        string qualityGrade; // A, B, C grade
        string warehouseLocation;
        uint256 harvestDate;
        string certificateHash; // IPFS hash of quality certificate
        address attestor; // Warehouse or cooperative that verified the asset
        bool isActive;
    }

    // Token information
    mapping(uint256 => AssetMetadata) public assetMetadata;
    mapping(address => bool) public authorizedAttestors;
    mapping(address => bool) public approvedMarkets; // Approved marketplaces/exchanges

    uint256 public nextTokenId;
    uint256 public totalPhysicalAssetValue; // Total USD value of all assets
    string public hederaTokenId; // Corresponding HTS token ID

    // Events
    event AssetTokenized(
        uint256 indexed tokenId,
        address indexed owner,
        string assetType,
        uint256 quantity,
        string warehouseLocation
    );

    event AssetVerified(
        uint256 indexed tokenId,
        address indexed attestor,
        string certificateHash
    );

    event AssetReleased(
        uint256 indexed tokenId,
        address indexed owner,
        string reason
    );

    event AttestorAuthorized(address indexed attestor, bool authorized);
    event MarketApproved(address indexed market, bool approved);

    // Modifiers
    modifier onlyAttestor() {
        require(authorizedAttestors[msg.sender], "Only authorized attestors can call this function");
        _;
    }

    modifier tokenExists(uint256 _tokenId) {
        require(_tokenId < nextTokenId && assetMetadata[_tokenId].isActive, "Token does not exist or is inactive");
        _;
    }

    constructor(
        string memory _name,
        string memory _symbol,
        string memory _hederaTokenId
    ) ERC20(_name, _symbol) {
        hederaTokenId = _hederaTokenId;
        nextTokenId = 1;
    }

    /**
     * @dev Tokenize a physical asset
     * @param _to Address to receive the tokens
     * @param _assetType Type of asset (maize, coffee, etc.)
     * @param _quantity Physical quantity of the asset
     * @param _qualityGrade Quality grade (A, B, C)
     * @param _warehouseLocation Location where asset is stored
     * @param _harvestDate Date when asset was harvested
     * @param _certificateHash IPFS hash of quality certificate
     * @return tokenId The ID of the minted token
     */
    function mintAssetToken(
        address _to,
        string memory _assetType,
        uint256 _quantity,
        string memory _qualityGrade,
        string memory _warehouseLocation,
        uint256 _harvestDate,
        string memory _certificateHash
    ) external onlyAttestor whenNotPaused returns (uint256) {
        require(_to != address(0), "Cannot mint to zero address");
        require(_quantity > 0, "Quantity must be greater than 0");
        require(bytes(_assetType).length > 0, "Asset type cannot be empty");
        require(bytes(_warehouseLocation).length > 0, "Warehouse location cannot be empty");

        uint256 tokenId = nextTokenId++;

        // Create asset metadata
        assetMetadata[tokenId] = AssetMetadata({
            assetType: _assetType,
            quantity: _quantity,
            qualityGrade: _qualityGrade,
            warehouseLocation: _warehouseLocation,
            harvestDate: _harvestDate,
            certificateHash: _certificateHash,
            attestor: msg.sender,
            isActive: true
        });

        // Mint tokens (1 token = 1 unit of asset, e.g., 1 kg)
        _mint(_to, _quantity);

        emit AssetTokenized(tokenId, _to, _assetType, _quantity, _warehouseLocation);
        emit AssetVerified(tokenId, msg.sender, _certificateHash);

        return tokenId;
    }

    /**
     * @dev Burn tokens when physical asset is sold or released
     * @param _tokenId ID of the asset token
     * @param _amount Amount of tokens to burn
     * @param _reason Reason for burning (sale, damage, etc.)
     */
    function burnAssetToken(
        uint256 _tokenId,
        uint256 _amount,
        string memory _reason
    ) external tokenExists(_tokenId) {
        AssetMetadata storage metadata = assetMetadata[_tokenId];

        // Only token holder, attestor, or owner can burn
        require(
            balanceOf(msg.sender) >= _amount ||
            msg.sender == metadata.attestor ||
            msg.sender == owner(),
            "Not authorized to burn tokens"
        );

        require(_amount <= metadata.quantity, "Cannot burn more than available quantity");

        // Update metadata
        metadata.quantity = metadata.quantity.sub(_amount);
        if (metadata.quantity == 0) {
            metadata.isActive = false;
        }

        // Burn tokens
        if (balanceOf(msg.sender) >= _amount) {
            _burn(msg.sender, _amount);
        } else {
            // If attestor or owner is burning, burn from total supply
            _burn(address(this), _amount);
        }

        emit AssetReleased(_tokenId, msg.sender, _reason);
    }

    /**
     * @dev Update asset certificate (e.g., re-inspection)
     * @param _tokenId ID of the asset token
     * @param _newCertificateHash New IPFS hash of certificate
     */
    function updateAssetCertificate(
        uint256 _tokenId,
        string memory _newCertificateHash
    ) external onlyAttestor tokenExists(_tokenId) {
        AssetMetadata storage metadata = assetMetadata[_tokenId];
        require(msg.sender == metadata.attestor, "Only original attestor can update certificate");

        metadata.certificateHash = _newCertificateHash;
        emit AssetVerified(_tokenId, msg.sender, _newCertificateHash);
    }

    /**
     * @dev Transfer tokens with additional validation for asset backing
     */
    function transfer(address to, uint256 amount) public virtual override returns (bool) {
        require(!paused(), "Token transfers are paused");
        require(to != address(0), "Cannot transfer to zero address");

        // Additional validation can be added here for market restrictions
        return super.transfer(to, amount);
    }

    /**
     * @dev Transfer tokens from one address to another with validation
     */
    function transferFrom(address from, address to, uint256 amount) public virtual override returns (bool) {
        require(!paused(), "Token transfers are paused");
        require(to != address(0), "Cannot transfer to zero address");

        return super.transferFrom(from, to, amount);
    }

    /**
     * @dev Get asset metadata for a token
     * @param _tokenId ID of the token
     * @return AssetMetadata struct
     */
    function getAssetMetadata(uint256 _tokenId) external view tokenExists(_tokenId) returns (AssetMetadata memory) {
        return assetMetadata[_tokenId];
    }

    /**
     * @dev Get total value of physical assets backing the tokens
     * @return Total USD value
     */
    function getTotalAssetValue() external view returns (uint256) {
        return totalPhysicalAssetValue;
    }

    /**
     * @dev Calculate asset value based on current market prices
     * @param _tokenId ID of the token
     * @param _pricePerUnit Price per unit in USD (with 18 decimals)
     * @return Total value of the asset
     */
    function calculateAssetValue(uint256 _tokenId, uint256 _pricePerUnit)
        external
        view
        tokenExists(_tokenId)
        returns (uint256)
    {
        AssetMetadata memory metadata = assetMetadata[_tokenId];
        return metadata.quantity.mul(_pricePerUnit);
    }

    /**
     * @dev Verify asset still exists in warehouse (called by oracles/attestors)
     * @param _tokenId ID of the token
     * @param _stillExists Whether asset still exists
     */
    function verifyAssetExistence(uint256 _tokenId, bool _stillExists)
        external
        onlyAttestor
        tokenExists(_tokenId)
    {
        if (!_stillExists) {
            assetMetadata[_tokenId].isActive = false;
            emit AssetReleased(_tokenId, msg.sender, "Asset no longer exists in warehouse");
        }
    }

    // Admin functions
    function authorizeAttestor(address _attestor, bool _authorized) external onlyOwner {
        authorizedAttestors[_attestor] = _authorized;
        emit AttestorAuthorized(_attestor, _authorized);
    }

    function approveMarket(address _market, bool _approved) external onlyOwner {
        approvedMarkets[_market] = _approved;
        emit MarketApproved(_market, _approved);
    }

    function setHederaTokenId(string memory _hederaTokenId) external onlyOwner {
        hederaTokenId = _hederaTokenId;
    }

    function updateTotalAssetValue(uint256 _newValue) external onlyOwner {
        totalPhysicalAssetValue = _newValue;
    }

    function pause() external onlyOwner {
        _pause();
    }

    function unpause() external onlyOwner {
        _unpause();
    }

    // Emergency functions
    function emergencyBurn(address _account, uint256 _amount) external onlyOwner {
        _burn(_account, _amount);
    }

    function emergencyMint(address _account, uint256 _amount) external onlyOwner {
        _mint(_account, _amount);
    }
}

/**
 * @title RWATokenFactory
 * @dev Factory contract for creating RWA tokens for different asset types
 */
contract RWATokenFactory is Ownable {

    event RWATokenCreated(
        address indexed tokenAddress,
        string assetType,
        string name,
        string symbol,
        address creator
    );

    mapping(string => address) public assetTypeTokens; // assetType => token contract address
    address[] public allTokens;

    function createRWAToken(
        string memory _assetType,
        string memory _name,
        string memory _symbol,
        string memory _hederaTokenId
    ) external onlyOwner returns (address) {
        require(bytes(_assetType).length > 0, "Asset type cannot be empty");
        require(assetTypeTokens[_assetType] == address(0), "Token for this asset type already exists");

        RWAToken newToken = new RWAToken(_name, _symbol, _hederaTokenId);
        address tokenAddress = address(newToken);

        assetTypeTokens[_assetType] = tokenAddress;
        allTokens.push(tokenAddress);

        // Transfer ownership to the factory owner
        newToken.transferOwnership(owner());

        emit RWATokenCreated(tokenAddress, _assetType, _name, _symbol, msg.sender);

        return tokenAddress;
    }

    function getTokenForAssetType(string memory _assetType) external view returns (address) {
        return assetTypeTokens[_assetType];
    }

    function getAllTokens() external view returns (address[] memory) {
        return allTokens;
    }

    function getTotalTokenTypes() external view returns (uint256) {
        return allTokens.length;
    }
}
