# 🌾 Hedera AgriFund - DeFi Platform for Agriculture

[![Hedera](https://img.shields.io/badge/Hedera-Hashgraph-blue)](https://hedera.com/)
[![Solidity](https://img.shields.io/badge/Solidity-0.8.19-363636)](https://soliditylang.org/)
[![Python](https://img.shields.io/badge/Python-Flask-green)](https://flask.palletsprojects.com/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

> **Tokenize crops as on-chain collateral on Hedera, connecting farmers with lenders through smart contracts that escrow RWA tokens and disburse stablecoins—transparent, low-cost, anti-double-pledge.**

---

**🌍 Languages**: [🇫🇷 Français](README.md) | [🇺🇸 English](README_EN.md)

---

## 📋 Table of Contents

- [🎯 Problem Statement](#-problem-statement)
- [💡 Solution](#-solution)
- [🏗️ Architecture](#️-architecture)
- [🚀 Features](#-features)
- [🔧 Tech Stack](#-tech-stack)
- [📱 User Interface](#-user-interface)
- [🛠️ Installation](#️-installation)
- [📚 API Documentation](#-api-documentation)
- [🧪 Testing](#-testing)
- [🚀 Deployment](#-deployment)
- [🤝 Contributing](#-contributing)
- [📄 License](#-license)

## 🎯 Problem Statement

Smallholder farmers face major challenges:

- **Asset-rich but cash-poor** - Own land and crops but lack working capital
- **Limited access to affordable credit** - Traditional banks require formal collateral that's hard to obtain
- **Warehouse receipt fraud** - Double financing and document forgery
- **Financial exclusion** - Traditional lending systems exclude rural farmers
- **Price volatility** - Uncertainty about agricultural collateral value

## 💡 Solution

### Integrated DeFi Platform on Hedera

Our revolutionary solution uses Hedera infrastructure to create a transparent and efficient financial ecosystem:

#### 🔗 Hedera Technologies Used

- **HTS (Hedera Token Service)** - Native tokenization of real-world assets (RWA)
- **HCS (Hedera Consensus Service)** - Tamper-proof audit logs
- **Smart Contracts** - Automated loan and collateral management
- **Low fees** - Transactions under $0.0001
- **Instant finality** - 3-5 second confirmation

#### 🎯 How It Works

1. **Tokenization** - Farmers tokenize their crops via HTS
2. **Valuation** - Decentralized price oracle for asset evaluation
3. **Collateralization** - Smart contract automatically escrows RWA tokens
4. **Funding** - Lenders provide funding in stablecoins
5. **Repayment** - Automated repayment system and collateral release

## 🏗️ Architecture

```
hedera-agrifund/
├── 🎨 frontend/              # User interface (HTML/CSS/JS)
│   ├── index.html           # Main page
│   ├── components/          # Reusable components
│   ├── js/                  # JavaScript logic
│   ├── styles/              # CSS styles
│   └── assets/              # Images and icons
├── 🐍 backend/              # Python Flask API
│   ├── app.py              # Main application
│   ├── models/             # Database models
│   ├── routes/             # API routes
│   └── services/           # Business services
├── 📜 contracts/            # Solidity smart contracts
│   ├── AgriFundLoanContract.sol    # Main lending contract
│   ├── RWAToken.sol               # Real-world asset token
│   ├── PriceOracle.sol            # Price oracle
│   └── test/                      # Contract tests
├── 📚 docs/                 # Documentation
├── 🔧 scripts/             # Deployment scripts
└── 🧪 tests/               # Test suites
```

## 🚀 Features

### ✅ Core Features

- **RWA Tokenization** - Convert crops into ERC-20 tokens on Hedera
- **Smart Contract Escrow** - Automatic collateral sequestration
- **Automated Lending System** - Complete loan lifecycle management
- **Anti-Double-Financing Protection** - On-chain verification of collateral uniqueness
- **Price Oracle Integration** - Real-time agricultural commodity prices
- **Liquidation Mechanisms** - Automatic liquidation on default

### 🔄 Advanced Features

- **Interactive Dashboard** - Real-time interface for farmers and lenders
- **Risk Management** - Integrated credit scoring system
- **KYC/AML Compliance** - Automated identity verification
- **Complete Audit Trail** - Full traceability via HCS
- **Multi-Currency Support** - USDC, HBAR, and other stablecoins
- **RESTful API** - Easy integration with third-party systems

## 🔧 Tech Stack

### Frontend
```javascript
// Technologies used
HTML5, CSS3, JavaScript ES6+
Web3.js for blockchain integration
Responsive Design (Mobile-First)
PWA (Progressive Web App)
```

### Backend
```python
# Python Stack
Flask - Web framework
SQLAlchemy - ORM
PostgreSQL - Database
Celery - Asynchronous tasks
Redis - Caching and sessions
```

### Blockchain
```solidity
// Smart Contracts
Solidity ^0.8.19
OpenZeppelin - Security libraries
Hedera SDK - Native integration
Hardhat - Development environment
```

## 📱 User Interface

### 👨‍🌾 Farmer Dashboard

- **RWA Portfolio** - Visualization of crop tokens
- **Loan Requests** - Creation and tracking of loan applications
- **History** - Transactions and repayments
- **KYC Profile** - Identity management and verifications

### 💰 Lender Dashboard

- **Investment Opportunities** - Marketplace of available loans
- **Portfolio** - Tracking of active investments
- **Analytics** - Returns and performance metrics
- **Risk Management** - Evaluation and diversification tools

## 🛠️ Installation

### Prerequisites

```bash
# Required tools
Node.js >= 16.0.0
Python >= 3.8
PostgreSQL >= 12
Git
```

### 1. Clone the Project

```bash
git clone https://github.com/Junior620/Hedera-AgriFund.git
cd Hedera-AgriFund
```

### 2. Backend Configuration

```bash
# Create Python virtual environment
cd backend
python -m venv venv

# Activate environment (Windows)
venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Database configuration
createdb hedera_agrifund
```

### 3. Environment Variables

```bash
# Create .env file
HEDERA_NETWORK=testnet
HEDERA_ACCOUNT_ID=your_account_id
HEDERA_PRIVATE_KEY=your_private_key
DATABASE_URL=postgresql://localhost/hedera_agrifund
SECRET_KEY=your_secret_key
```

### 4. Smart Contract Deployment

```bash
cd contracts
npm install
npx hardhat compile
npx hardhat deploy --network hedera-testnet
```

### 5. Application Launch

```bash
# Backend
cd backend
python app.py

# Frontend (serve static files)
cd frontend
python -m http.server 8080
```

## 📚 API Documentation

### 🔐 Authentication

```http
POST /api/auth/login
Content-Type: application/json

{
  "hedera_account_id": "0.0.123456",
  "signature": "signature_from_wallet"
}
```

### 👤 User Management

```http
# Create user
POST /api/users
{
  "name": "John Doe",
  "user_type": "farmer",
  "email": "john@example.com",
  "hedera_account_id": "0.0.123456"
}

# User profile
GET /api/users/{id}
```

### 🌾 RWA Tokenization

```http
# Create RWA token
POST /api/rwa/tokenize
{
  "asset_type": "wheat",
  "quantity": 1000,
  "quality_grade": "A",
  "harvest_date": "2024-09-15",
  "location": "coordinates"
}
```

### 💰 Loan Management

```http
# Create loan request
POST /api/loans
{
  "amount": 10000,
  "duration_days": 90,
  "collateral_token_id": "0.0.789012",
  "interest_rate": 850
}

# Fund a loan
POST /api/loans/{id}/fund
{
  "lender_id": "user_id",
  "amount": 10000
}
```

## 🧪 Testing

### Smart Contract Tests

```bash
cd contracts
npm test
```

### Backend Tests

```bash
cd backend
python -m pytest tests/
```

## 🚀 Deployment

### Production Hedera Mainnet

```bash
# 1. Mainnet configuration
export HEDERA_NETWORK=mainnet

# 2. Contract deployment
npx hardhat deploy --network hedera-mainnet

# 3. Backend deployment
docker build -t agrifund-backend .
docker run -p 5000:5000 agrifund-backend
```

## 🤝 Contributing

### How to Contribute

1. **Fork** the project
2. Create a **feature branch** (`git checkout -b feature/AmazingFeature`)
3. **Commit** your changes (`git commit -m 'Add AmazingFeature'`)
4. **Push** to the branch (`git push origin feature/AmazingFeature`)
5. Open a **Pull Request**

### Guidelines

- Follow existing code conventions
- Add tests for new features
- Update documentation
- Follow security best practices

## 📊 Roadmap

### Q4 2024
- ✅ MVP Core Platform
- ✅ Smart Contracts Testnet
- ✅ Beta User Interface

### Q1 2025
- 🔄 Security Audit
- 🔄 Mainnet Deployment
- 🔄 Price Oracle Integration

### Q2 2025
- 📅 Multi-Collateral Support
- 📅 DAO Governance Token
- 📅 Native Mobile App

### Q3 2025
- 📅 Geographic Expansion
- 📅 Bank Partnerships
- 📅 IoT Farming Integration

## 📈 Metrics

- **Total Value Locked (TVL)**: $0 (Pre-launch)
- **Number of Farmers**: 0 (Pre-launch)
- **Loans Processed**: 0 (Pre-launch)
- **Average Default Rate**: N/A (Target: <5%)

## 🌍 Social Impact

### Sustainable Development Goals (SDGs)

- **SDG 1** - No Poverty
- **SDG 2** - Zero Hunger
- **SDG 8** - Decent Work and Economic Growth
- **SDG 10** - Reduced Inequalities

### Impact Metrics

- Number of farmers financed
- Volume of tokenized crops
- Improvement in agricultural income
- Reduction in post-harvest losses

## 👥 Team

- **Junior620** - Lead Developer & Blockchain Architect
- **Contributors Welcome** - Join the team!

## 📞 Contact & Support

- **GitHub**: [https://github.com/Junior620/Hedera-AgriFund](https://github.com/Junior620/Hedera-AgriFund)
- **Email Support**: support@hedera-agrifund.com
- **Discord Community**: [Join](https://discord.gg/hedera-agrifund)
- **Telegram**: [@HederaAgriFund](https://t.me/HederaAgriFund)

## 📄 License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

---

<div align="center">

**🌾 Building the future of decentralized agricultural finance together 🌾**

[![Hedera](https://img.shields.io/badge/Powered%20by-Hedera-blue)](https://hedera.com/)
[![DeFi](https://img.shields.io/badge/Category-DeFi-green)](https://defipulse.com/)
[![Agriculture](https://img.shields.io/badge/Sector-Agriculture-orange)](https://www.fao.org/)

*Democratizing access to credit for farmers worldwide via Hedera blockchain*

</div>
