// Web3 Integration for Hedera AgriFund
class Web3Integration {
    constructor() {
        this.web3 = null;
        this.accounts = [];
        this.networkId = null;
        this.contracts = {};
    }

    // Initialize Web3
    async init() {
        try {
            // Modern dapp browsers
            if (window.ethereum) {
                this.web3 = new Web3(window.ethereum);
                console.log('Web3 initialized with MetaMask/Modern browser');
                return true;
            }
            // Legacy dapp browsers
            else if (window.web3) {
                this.web3 = new Web3(window.web3.currentProvider);
                console.log('Web3 initialized with Legacy browser');
                return true;
            }
            // Fallback to local provider
            else {
                this.web3 = new Web3(new Web3.providers.HttpProvider('http://localhost:8545'));
                console.log('Web3 initialized with local provider');
                return true;
            }
        } catch (error) {
            console.error('Web3 initialization failed:', error);
            return false;
        }
    }

    // Connect to wallet
    async connectWallet() {
        try {
            if (window.ethereum) {
                // Request account access
                this.accounts = await window.ethereum.request({
                    method: 'eth_requestAccounts'
                });

                // Get network ID
                this.networkId = await this.web3.eth.net.getId();

                // Listen for account changes
                window.ethereum.on('accountsChanged', (accounts) => {
                    this.accounts = accounts;
                    this.onAccountChanged(accounts);
                });

                // Listen for network changes
                window.ethereum.on('chainChanged', (chainId) => {
                    this.networkId = parseInt(chainId, 16);
                    this.onNetworkChanged(this.networkId);
                });

                return {
                    success: true,
                    account: this.accounts[0],
                    networkId: this.networkId
                };
            }
        } catch (error) {
            console.error('Wallet connection failed:', error);
            return { success: false, error: error.message };
        }
    }

    // Load smart contracts
    async loadContracts() {
        try {
            // Loan Factory Contract ABI (simplified)
            const loanFactoryABI = [
                {
                    "inputs": [
                        {"name": "_borrower", "type": "address"},
                        {"name": "_loanAmount", "type": "uint256"},
                        {"name": "_collateralToken", "type": "address"},
                        {"name": "_collateralAmount", "type": "uint256"},
                        {"name": "_interestRate", "type": "uint256"},
                        {"name": "_duration", "type": "uint256"}
                    ],
                    "name": "createLoan",
                    "outputs": [{"name": "", "type": "address"}],
                    "type": "function"
                },
                {
                    "inputs": [{"name": "_loanId", "type": "uint256"}],
                    "name": "getLoanDetails",
                    "outputs": [
                        {"name": "borrower", "type": "address"},
                        {"name": "lender", "type": "address"},
                        {"name": "amount", "type": "uint256"},
                        {"name": "status", "type": "uint8"}
                    ],
                    "type": "function"
                }
            ];

            // RWA Token Contract ABI
            const rwaTokenABI = [
                {
                    "inputs": [
                        {"name": "_to", "type": "address"},
                        {"name": "_amount", "type": "uint256"},
                        {"name": "_metadata", "type": "string"}
                    ],
                    "name": "mint",
                    "outputs": [],
                    "type": "function"
                },
                {
                    "inputs": [
                        {"name": "_from", "type": "address"},
                        {"name": "_amount", "type": "uint256"}
                    ],
                    "name": "burn",
                    "outputs": [],
                    "type": "function"
                }
            ];

            // Contract addresses (testnet)
            const contractAddresses = {
                loanFactory: '0x1234567890123456789012345678901234567890',
                rwaToken: '0x0987654321098765432109876543210987654321',
                stablecoin: '0x1111111111111111111111111111111111111111',
                oracle: '0x2222222222222222222222222222222222222222'
            };

            // Initialize contracts
            this.contracts.loanFactory = new this.web3.eth.Contract(
                loanFactoryABI,
                contractAddresses.loanFactory
            );

            this.contracts.rwaToken = new this.web3.eth.Contract(
                rwaTokenABI,
                contractAddresses.rwaToken
            );

            console.log('Smart contracts loaded successfully');
            return true;

        } catch (error) {
            console.error('Contract loading failed:', error);
            return false;
        }
    }

    // Create loan on smart contract
    async createLoan(loanData) {
        try {
            const { borrower, loanAmount, collateralToken, collateralAmount, interestRate, duration } = loanData;

            const tx = await this.contracts.loanFactory.methods.createLoan(
                borrower,
                this.web3.utils.toWei(loanAmount.toString(), 'ether'),
                collateralToken,
                collateralAmount,
                interestRate * 100, // Convert to basis points
                duration * 86400 // Convert days to seconds
            ).send({
                from: this.accounts[0],
                gas: 500000
            });

            return {
                success: true,
                transactionHash: tx.transactionHash,
                loanAddress: tx.events.LoanCreated?.returnValues?.loanAddress
            };

        } catch (error) {
            console.error('Loan creation failed:', error);
            return { success: false, error: error.message };
        }
    }

    // Fund a loan
    async fundLoan(loanAddress, amount) {
        try {
            // First approve stablecoin transfer
            const stablecoinContract = new this.web3.eth.Contract(
                [
                    {
                        "inputs": [
                            {"name": "_spender", "type": "address"},
                            {"name": "_amount", "type": "uint256"}
                        ],
                        "name": "approve",
                        "outputs": [],
                        "type": "function"
                    }
                ],
                this.contracts.stablecoin
            );

            await stablecoinContract.methods.approve(
                loanAddress,
                this.web3.utils.toWei(amount.toString(), 'ether')
            ).send({ from: this.accounts[0] });

            // Then fund the loan
            const loanContract = new this.web3.eth.Contract(
                [
                    {
                        "inputs": [],
                        "name": "fundLoan",
                        "outputs": [],
                        "type": "function"
                    }
                ],
                loanAddress
            );

            const tx = await loanContract.methods.fundLoan().send({
                from: this.accounts[0],
                gas: 300000
            });

            return {
                success: true,
                transactionHash: tx.transactionHash
            };

        } catch (error) {
            console.error('Loan funding failed:', error);
            return { success: false, error: error.message };
        }
    }

    // Repay loan
    async repayLoan(loanAddress, amount) {
        try {
            const loanContract = new this.web3.eth.Contract(
                [
                    {
                        "inputs": [{"name": "_amount", "type": "uint256"}],
                        "name": "repay",
                        "outputs": [],
                        "type": "function"
                    }
                ],
                loanAddress
            );

            const tx = await loanContract.methods.repay(
                this.web3.utils.toWei(amount.toString(), 'ether')
            ).send({
                from: this.accounts[0],
                gas: 200000
            });

            return {
                success: true,
                transactionHash: tx.transactionHash
            };

        } catch (error) {
            console.error('Loan repayment failed:', error);
            return { success: false, error: error.message };
        }
    }

    // Liquidate loan
    async liquidateLoan(loanAddress) {
        try {
            const loanContract = new this.web3.eth.Contract(
                [
                    {
                        "inputs": [],
                        "name": "liquidate",
                        "outputs": [],
                        "type": "function"
                    }
                ],
                loanAddress
            );

            const tx = await loanContract.methods.liquidate().send({
                from: this.accounts[0],
                gas: 250000
            });

            return {
                success: true,
                transactionHash: tx.transactionHash
            };

        } catch (error) {
            console.error('Liquidation failed:', error);
            return { success: false, error: error.message };
        }
    }

    // Get loan details
    async getLoanDetails(loanAddress) {
        try {
            const loanContract = new this.web3.eth.Contract(
                [
                    {
                        "inputs": [],
                        "name": "getLoanDetails",
                        "outputs": [
                            {"name": "borrower", "type": "address"},
                            {"name": "lender", "type": "address"},
                            {"name": "amount", "type": "uint256"},
                            {"name": "interestRate", "type": "uint256"},
                            {"name": "duration", "type": "uint256"},
                            {"name": "status", "type": "uint8"}
                        ],
                        "type": "function"
                    }
                ],
                loanAddress
            );

            const details = await loanContract.methods.getLoanDetails().call();

            return {
                success: true,
                borrower: details.borrower,
                lender: details.lender,
                amount: this.web3.utils.fromWei(details.amount, 'ether'),
                interestRate: details.interestRate / 100,
                duration: details.duration / 86400,
                status: details.status
            };

        } catch (error) {
            console.error('Failed to get loan details:', error);
            return { success: false, error: error.message };
        }
    }

    // Get user's token balance
    async getTokenBalance(tokenAddress, userAddress) {
        try {
            const tokenContract = new this.web3.eth.Contract(
                [
                    {
                        "inputs": [{"name": "_owner", "type": "address"}],
                        "name": "balanceOf",
                        "outputs": [{"name": "", "type": "uint256"}],
                        "type": "function"
                    }
                ],
                tokenAddress
            );

            const balance = await tokenContract.methods.balanceOf(userAddress).call();
            return {
                success: true,
                balance: this.web3.utils.fromWei(balance, 'ether')
            };

        } catch (error) {
            console.error('Failed to get token balance:', error);
            return { success: false, error: error.message };
        }
    }

    // Event handlers
    onAccountChanged(accounts) {
        console.log('Account changed:', accounts[0]);
        // Trigger UI update
        if (window.app) {
            window.app.updateWalletInfo();
        }
    }

    onNetworkChanged(networkId) {
        console.log('Network changed:', networkId);
        // Reload contracts for new network
        this.loadContracts();
    }

    // Utility functions
    formatAddress(address) {
        return `${address.slice(0, 6)}...${address.slice(-4)}`;
    }

    formatAmount(amount, decimals = 2) {
        return parseFloat(amount).toFixed(decimals);
    }

    validateAddress(address) {
        return this.web3.utils.isAddress(address);
    }

    async getTransactionStatus(txHash) {
        try {
            const receipt = await this.web3.eth.getTransactionReceipt(txHash);
            return {
                success: true,
                status: receipt.status,
                gasUsed: receipt.gasUsed,
                blockNumber: receipt.blockNumber
            };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    // Estimate gas for transactions
    async estimateGas(contract, method, params, from) {
        try {
            const gas = await contract.methods[method](...params).estimateGas({ from });
            return Math.ceil(gas * 1.1); // Add 10% buffer
        } catch (error) {
            console.error('Gas estimation failed:', error);
            return 500000; // Default gas limit
        }
    }
}

// Export for use in other modules
window.Web3Integration = Web3Integration;
