# Hedera AgriFund - Technical Documentation

## 📋 Project Overview

Hedera AgriFund is a decentralized micro-finance platform that enables smallholder farmers to tokenize their crops as collateral and access funding from global lenders. The platform leverages Hedera's unique features including HTS (Hedera Token Service), HCS (Hedera Consensus Service), and low-cost transactions.

## 🏗️ Architecture

### Frontend (HTML/CSS/JavaScript)
- **Technology**: Vanilla HTML5, CSS3, ES6+ JavaScript
- **Features**: 
  - Responsive farmer and lender dashboards
  - Wallet integration (HashPack, MetaMask)
  - Real-time loan management
  - Asset tokenization interface
  - Investment opportunities marketplace

### Backend (Python Flask)
- **Technology**: Flask, SQLAlchemy, PostgreSQL
- **Features**:
  - RESTful API for all platform operations
  - User management with KYC integration
  - Loan lifecycle management
  - Price oracle integration
  - Audit trail and analytics
  - HCS event logging

### Smart Contracts (Solidity)
- **AgriFundLoanContract**: Main lending protocol with escrow and liquidation
- **RWAToken**: ERC20 tokens representing real-world assets (crops)
- **PriceOracle**: Decentralized price feeds for commodities
- **MockERC20**: Test stablecoin for development

## 🔧 Setup Instructions

### Prerequisites
```bash
- Node.js 16+
- Python 3.8+
- PostgreSQL
- Git
```

### Backend Setup
```bash
cd backend
pip install -r requirements.txt
python app.py
```

### Smart Contracts Setup
```bash
cd contracts
npm install
npx hardhat compile
npx hardhat deploy --network hedera-testnet
```

### Frontend Setup
```bash
cd frontend
# Serve via HTTP server
python -m http.server 8000
# Or use any web server
```

## 📊 Key Features

### For Farmers
1. **Asset Tokenization**: Convert crops to HTS tokens
2. **Loan Requests**: Create loan proposals with tokenized collateral
3. **Automated Repayment**: Smart contract-managed repayment
4. **Credit Building**: On-chain credit history via HCS

### For Lenders
1. **Investment Opportunities**: Browse verified loan requests
2. **Risk Assessment**: LTV ratios and credit scores
3. **Automated Returns**: Interest payments via smart contracts
4. **Portfolio Management**: Track investments and returns

### Platform Features
1. **Anti-Double-Pledge**: HCS audit trail prevents fraud
2. **Price Oracles**: Real-time commodity pricing
3. **Liquidation Protection**: Automated collateral management
4. **ESG Integration**: Guardian-based sustainability badges

## 🔒 Security Features

- **Multi-signature** warehouse attestation
- **Over-collateralization** with dynamic LTV ratios
- **Automated liquidation** when thresholds are breached
- **Immutable audit trail** via Hedera Consensus Service
- **KYC/AML compliance** switches

## 📈 Business Model

- **Platform Fee**: 0.5-1.0% on funded loans
- **Revenue Sharing**: Split fees with attestors/warehouses
- **HTS Custom Fees**: Built-in fee collection
- **Premium Features**: Advanced analytics and ESG badges

## 🌍 Impact Metrics

- **Financial Inclusion**: Banking the unbanked farmers
- **Reduced Interest Rates**: Competitive vs traditional MFIs
- **Transparency**: Full audit trail on blockchain
- **Global Access**: Diaspora lending connections

## 🚀 Deployment Guide

### Environment Setup
1. Copy `.env.example` to `.env`
2. Fill in Hedera account details
3. Configure database connection
4. Set up IPFS node (optional)

### Database Migration
```bash
cd backend
python -c "from app import db; db.create_all()"
```

### Contract Deployment
```bash
cd contracts
npm run deploy:testnet
```

## 🧪 Testing

### Smart Contract Tests
```bash
cd contracts
npm test
```

### Backend API Tests
```bash
cd backend
pytest
```

### Frontend Testing
- Manual testing via browser
- Integration tests with deployed contracts

## 📚 API Documentation

### User Management
- `POST /api/users/register` - Register new user
- `GET /api/users/<account_id>` - Get user profile

### Token Management
- `POST /api/tokens/mint` - Mint RWA token
- `GET /api/tokens/user/<account_id>` - Get user tokens

### Loan Management
- `POST /api/loans/create` - Create loan request
- `POST /api/loans/fund` - Fund a loan
- `GET /api/loans/opportunities` - Get investment opportunities

### Price Oracle
- `GET /api/prices/<commodity>` - Get commodity price

## 🔄 Integration Guide

### Hedera Services
- **HTS**: Token creation and management
- **HCS**: Event logging and audit trail
- **Smart Contracts**: Business logic execution
- **Mirror Node**: Historical data queries

### External Integrations
- **IPFS**: Document storage
- **Price APIs**: Market data feeds
- **Weather APIs**: Parametric insurance triggers
- **KYC Providers**: Identity verification

## 🛠️ Development Workflow

1. **Local Development**: Use hardhat local node
2. **Testing**: Deploy to Hedera testnet
3. **Staging**: Full integration testing
4. **Production**: Mainnet deployment

## 📋 Maintenance

### Regular Tasks
- Update commodity prices
- Monitor loan health
- Process liquidations
- Update exchange rates

### Monitoring
- Contract event monitoring
- API performance metrics
- Database health checks
- Security alerts

## 🆘 Troubleshooting

### Common Issues
1. **Wallet Connection**: Ensure HashPack is installed
2. **Transaction Failures**: Check gas limits and balances
3. **Price Updates**: Verify oracle authorization
4. **Database Errors**: Check connection strings

### Support Channels
- GitHub Issues
- Documentation Wiki
- Community Discord
- Technical Support Email

## 📄 License

MIT License - See LICENSE file for details

## 🤝 Contributing

1. Fork the repository
2. Create feature branch
3. Add tests for new features
4. Submit pull request

---

**Built with ❤️ for African farmers and the global community**
