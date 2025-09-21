const { ethers } = require("hardhat");
const { Client, PrivateKey, AccountId, ContractCreateTransaction, ContractExecuteTransaction, Hbar } = require("@hashgraph/sdk");

async function main() {
    console.log("🚀 Starting Hedera AgriFund Contract Deployment...");

    // Get deployer account
    const [deployer] = await ethers.getSigners();
    console.log(`📝 Deploying contracts with account: ${deployer.address}`);
    console.log(`💰 Account balance: ${ethers.utils.formatEther(await deployer.getBalance())} ETH`);

    // Contract deployment parameters
    const deploymentConfig = {
        stablecoinToken: "0x0000000000000000000000000000000000000000", // Will be updated after stablecoin deployment
        platformFeeRate: 100, // 1% platform fee
        platformFeeRecipient: deployer.address,
        maxLtvRatio: 8500, // 85% maximum LTV
        liquidationThreshold: 9000, // 90% liquidation threshold
        priceValidityPeriod: 3600, // 1 hour price validity
        hcsTopicId: "0.0.555555" // Mock HCS topic ID
    };

    console.log("\n📋 Deployment Configuration:");
    console.log(JSON.stringify(deploymentConfig, null, 2));

    try {
        // 1. Deploy Price Oracle
        console.log("\n🔮 Deploying PriceOracle...");
        const PriceOracle = await ethers.getContractFactory("PriceOracle");
        const priceOracle = await PriceOracle.deploy(
            deploymentConfig.priceValidityPeriod,
            deploymentConfig.hcsTopicId
        );
        await priceOracle.deployed();
        console.log(`✅ PriceOracle deployed to: ${priceOracle.address}`);

        // 2. Deploy RWA Token Factory
        console.log("\n🏭 Deploying RWATokenFactory...");
        const RWATokenFactory = await ethers.getContractFactory("RWATokenFactory");
        const rwaTokenFactory = await RWATokenFactory.deploy();
        await rwaTokenFactory.deployed();
        console.log(`✅ RWATokenFactory deployed to: ${rwaTokenFactory.address}`);

        // 3. Create RWA Tokens for different crops
        console.log("\n🌾 Creating RWA Tokens for different crops...");
        const cropTokens = {};
        const crops = [
            { type: "maize", name: "Maize RWA Token", symbol: "MAIZE-RWA" },
            { type: "rice", name: "Rice RWA Token", symbol: "RICE-RWA" },
            { type: "coffee", name: "Coffee RWA Token", symbol: "COFFEE-RWA" },
            { type: "wheat", name: "Wheat RWA Token", symbol: "WHEAT-RWA" },
            { type: "cocoa", name: "Cocoa RWA Token", symbol: "COCOA-RWA" }
        ];

        for (const crop of crops) {
            console.log(`  📝 Creating ${crop.type} token...`);
            const tx = await rwaTokenFactory.createRWAToken(
                crop.type,
                crop.name,
                crop.symbol,
                `0.0.${Math.floor(Math.random() * 1000000)}` // Mock Hedera Token ID
            );
            await tx.wait();

            const tokenAddress = await rwaTokenFactory.getTokenForAssetType(crop.type);
            cropTokens[crop.type] = tokenAddress;
            console.log(`  ✅ ${crop.type} token created at: ${tokenAddress}`);
        }

        // 4. Deploy Mock Stablecoin (for testing)
        console.log("\n💰 Deploying Mock Stablecoin...");
        const MockERC20 = await ethers.getContractFactory("contracts/test/MockERC20.sol:MockERC20");
        const stablecoin = await MockERC20.deploy(
            "AgriFund USD",
            "AUSD",
            ethers.utils.parseEther("1000000") // 1M initial supply
        );
        await stablecoin.deployed();
        console.log(`✅ Mock Stablecoin deployed to: ${stablecoin.address}`);

        // Update deployment config with stablecoin address
        deploymentConfig.stablecoinToken = stablecoin.address;

        // 5. Deploy AgriFund Loan Contract
        console.log("\n💼 Deploying AgriFundLoanContract...");
        const AgriFundLoanContract = await ethers.getContractFactory("AgriFundLoanContract");
        const loanContract = await AgriFundLoanContract.deploy(
            deploymentConfig.stablecoinToken,
            deploymentConfig.platformFeeRate,
            deploymentConfig.platformFeeRecipient,
            deploymentConfig.maxLtvRatio,
            deploymentConfig.liquidationThreshold
        );
        await loanContract.deployed();
        console.log(`✅ AgriFundLoanContract deployed to: ${loanContract.address}`);

        // 6. Setup initial configuration
        console.log("\n⚙️ Setting up initial configuration...");

        // Authorize price oracle
        console.log("  📝 Authorizing deployer as oracle...");
        await priceOracle.setOracleAuthorization(deployer.address, true);

        // Add approved collateral tokens to loan contract
        console.log("  📝 Adding approved collateral tokens...");
        for (const [cropType, tokenAddress] of Object.entries(cropTokens)) {
            await loanContract.addApprovedCollateralToken(tokenAddress);
            console.log(`    ✅ ${cropType} token approved as collateral`);
        }

        // Set initial prices
        console.log("  📝 Setting initial commodity prices...");
        const initialPrices = {
            maize: ethers.utils.parseUnits("250", 8), // $250 per unit
            rice: ethers.utils.parseUnits("420", 8),  // $420 per unit
            coffee: ethers.utils.parseUnits("1250", 8), // $1250 per unit
            wheat: ethers.utils.parseUnits("300", 8),  // $300 per unit
            cocoa: ethers.utils.parseUnits("2800", 8)  // $2800 per unit
        };

        for (const [commodity, price] of Object.entries(initialPrices)) {
            await priceOracle.updatePrice(commodity, price, 9000); // 90% confidence
            console.log(`    ✅ ${commodity} price set to $${ethers.utils.formatUnits(price, 8)}`);
        }

        // 7. Create deployment summary
        const deploymentSummary = {
            network: hre.network.name,
            deployer: deployer.address,
            timestamp: new Date().toISOString(),
            contracts: {
                PriceOracle: priceOracle.address,
                RWATokenFactory: rwaTokenFactory.address,
                AgriFundLoanContract: loanContract.address,
                MockStablecoin: stablecoin.address,
                CropTokens: cropTokens
            },
            configuration: deploymentConfig,
            initialPrices: Object.fromEntries(
                Object.entries(initialPrices).map(([k, v]) => [k, ethers.utils.formatUnits(v, 8)])
            )
        };

        console.log("\n📊 Deployment Summary:");
        console.log(JSON.stringify(deploymentSummary, null, 2));

        // Save deployment summary to file
        const fs = require('fs');
        const path = require('path');
        const deploymentsDir = path.join(__dirname, '..', 'deployments');
        if (!fs.existsSync(deploymentsDir)) {
            fs.mkdirSync(deploymentsDir, { recursive: true });
        }

        const deploymentFile = path.join(deploymentsDir, `${hre.network.name}-deployment.json`);
        fs.writeFileSync(deploymentFile, JSON.stringify(deploymentSummary, null, 2));
        console.log(`\n💾 Deployment summary saved to: ${deploymentFile}`);

        console.log("\n🎉 Deployment completed successfully!");
        console.log("\n📋 Next Steps:");
        console.log("1. Update frontend configuration with contract addresses");
        console.log("2. Update backend API with contract addresses");
        console.log("3. Verify contracts on Hedera explorer");
        console.log("4. Test the complete flow");

    } catch (error) {
        console.error("\n❌ Deployment failed:", error);
        process.exit(1);
    }
}

// Execute deployment
main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
