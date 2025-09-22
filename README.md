# 🌾 Hedera AgriFund - Plateforme DeFi pour l'Agriculture / DeFi Platform for Agriculture

[![Hedera](https://img.shields.io/badge/Hedera-Hashgraph-blue)](https://hedera.com/)
[![Solidity](https://img.shields.io/badge/Solidity-0.8.19-363636)](https://soliditylang.org/)
[![Python](https://img.shields.io/badge/Python-Flask-green)](https://flask.palletsprojects.com/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

> **🇫🇷 Tokenisation des récoltes comme garantie on-chain sur Hedera, connectant les agriculteurs avec les prêteurs via des smart contracts qui séquestre les tokens RWA et distribuent des stablecoins—transparent, peu coûteux, anti-double-financement.**

> **🇺🇸 Tokenize crops as on-chain collateral on Hedera, connecting farmers with lenders through smart contracts that escrow RWA tokens and disburse stablecoins—transparent, low-cost, anti-double-pledge.**

---

**🌍 Languages**: [🇫🇷 Français](#français) | [🇺🇸 English](#english)

---

# 🇫🇷 Français

## 📋 Table des Matières

- [🎯 Problématique](#-problématique)
- [💡 Solution](#-solution)
- [🏗️ Architecture](#️-architecture)
- [🚀 Fonctionnalités](#-fonctionnalités)
- [🔧 Stack Technique](#-stack-technique)
- [📱 Interface Utilisateur](#-interface-utilisateur)
- [🛠️ Installation](#️-installation)
- [📚 Documentation API](#-documentation-api)
- [🧪 Tests](#-tests)
- [🚀 Déploiement](#-déploiement)
- [🤝 Contribution](#-contribution)
- [📄 Licence](#-licence)

## 🎯 Problématique

Les petits agriculteurs font face à des défis majeurs :

- **Riches en actifs mais pauvres en liquidités** - Possèdent des terres et des récoltes mais manquent de capital circulant
- **Accès limité au crédit abordable** - Les banques traditionnelles exigent des garanties formelles difficiles à obtenir
- **Fraude aux récépissés d'entrepôt** - Double financement et falsification des documents
- **Exclusion financière** - Les systèmes de prêt traditionnels excluent les agriculteurs ruraux
- **Volatilité des prix** - Incertitude sur la valeur des garanties agricoles

## 💡 Solution

### Plateforme DeFi intégrée sur Hedera

Notre solution révolutionnaire utilise l'infrastructure Hedera pour créer un écosystème financier transparent et efficace :

#### 🔗 Technologies Hedera Utilisées

- **HTS (Hedera Token Service)** - Tokenisation native des actifs réels (RWA)
- **HCS (Hedera Consensus Service)** - Journaux d'audit inviolables
- **Smart Contracts** - Gestion automatisée des prêts et garanties
- **Faibles frais** - Transactions à moins de $0.0001
- **Finalité instantanée** - Confirmation en 3-5 secondes

#### 🎯 Fonctionnement

1. **Tokenisation** - Les agriculteurs tokenisent leurs récoltes via HTS
2. **Évaluation** - Oracle de prix décentralisé pour l'évaluation des actifs
3. **Mise en garantie** - Smart contract séquestre automatiquement les tokens RWA
4. **Financement** - Les prêteurs financent en stablecoins
5. **Remboursement** - Système automatisé de remboursement et libération des garanties

## 🏗️ Architecture

```
hedera-agrifund/
├── 🎨 frontend/              # Interface utilisateur (HTML/CSS/JS)
│   ├── index.html           # Page principale
│   ├── components/          # Composants réutilisables
│   ├── js/                  # Logique JavaScript
│   ├── styles/              # Styles CSS
│   └── assets/              # Images et icônes
├── 🐍 backend/              # API Python Flask
│   ├── app.py              # Application principale
│   ├── models/             # Modèles de base de données
│   ├── routes/             # Routes API
│   └── services/           # Services métier
├── 📜 contracts/            # Smart contracts Solidity
│   ├── AgriFundLoanContract.sol    # Contrat principal de prêt
│   ├── RWAToken.sol               # Token pour actifs réels
│   ├── PriceOracle.sol            # Oracle de prix
│   └── test/                      # Tests des contrats
├── 📚 docs/                 # Documentation
├── 🔧 scripts/             # Scripts de déploiement
└── 🧪 tests/               # Suite de tests
```

## 🚀 Fonctionnalités

### ✅ Fonctionnalités Core

- **Tokenisation RWA** - Conversion des récoltes en tokens ERC-20 sur Hedera
- **Smart Contract Escrow** - Séquestration automatique des garanties
- **Système de Prêt Automatisé** - Gestion complète du cycle de vie des prêts
- **Protection Anti-Double-Financement** - Vérification on-chain de l'unicité des garanties
- **Intégration Oracle Prix** - Prix en temps réel des commodités agricoles
- **Mécanismes de Liquidation** - Liquidation automatique en cas de défaut

### 🔄 Fonctionnalités Avancées

- **Tableau de Bord Interactif** - Interface en temps réel pour agriculteurs et prêteurs
- **Gestion des Risques** - Système de scoring de crédit intégré
- **Conformité KYC/AML** - Vérification d'identité automatisée
- **Audit Trail Complet** - Traçabilité complète via HCS
- **Support Multi-Devises** - USDC, HBAR, et autres stablecoins
- **API RESTful** - Intégration facile avec systèmes tiers

## 🔧 Stack Technique

### Frontend
```javascript
// Technologies utilisées
HTML5, CSS3, JavaScript ES6+
Web3.js pour l'intégration blockchain
Responsive Design (Mobile-First)
PWA (Progressive Web App)
```

### Backend
```python
# Stack Python
Flask - Framework web
SQLAlchemy - ORM
PostgreSQL - Base de données
Celery - Tâches asynchrones
Redis - Cache et sessions
```

### Blockchain
```solidity
// Smart Contracts
Solidity ^0.8.19
OpenZeppelin - Librairies sécurisées
Hedera SDK - Intégration native
Hardhat - Environnement de développement
```

## 📱 Interface Utilisateur

### 👨‍🌾 Dashboard Agriculteur

- **Portefeuille RWA** - Visualisation des tokens de récoltes
- **Demandes de Prêt** - Création et suivi des demandes
- **Historique** - Transactions et remboursements
- **Profil KYC** - Gestion de l'identité et vérifications

### 💰 Dashboard Prêteur

- **Opportunités d'Investissement** - Marketplace des prêts disponibles
- **Portefeuille** - Suivi des investissements actifs
- **Analytics** - Rendements et métriques de performance
- **Gestion des Risques** - Outils d'évaluation et diversification

## 🛠️ Installation

### Prérequis

```bash
# Outils requis
Node.js >= 16.0.0
Python >= 3.8
PostgreSQL >= 12
Git
```

### 1. Cloner le Projet

```bash
git clone https://github.com/Junior620/Hedera-AgriFund.git
cd Hedera-AgriFund
```

### 2. Configuration Backend

```bash
# Créer environnement virtuel Python
cd backend
python -m venv venv

# Activer l'environnement (Windows)
venv\Scripts\activate

# Installer dépendances
pip install -r requirements.txt

# Configuration base de données
createdb hedera_agrifund
```

### 3. Variables d'Environnement

```bash
# Créer fichier .env
HEDERA_NETWORK=testnet
HEDERA_ACCOUNT_ID=your_account_id
HEDERA_PRIVATE_KEY=your_private_key
DATABASE_URL=postgresql://localhost/hedera_agrifund
SECRET_KEY=your_secret_key
```

### 4. Déploiement Smart Contracts

```bash
cd contracts
npm install
npx hardhat compile
npx hardhat deploy --network hedera-testnet
```

### 5. Lancement de l'Application

```bash
# Backend
cd backend
python app.py

# Frontend (servir les fichiers statiques)
cd frontend
python -m http.server 8080
```

## 📚 Documentation API

### 🔐 Authentification

```http
POST /api/auth/login
Content-Type: application/json

{
  "hedera_account_id": "0.0.123456",
  "signature": "signature_from_wallet"
}
```

### 👤 Gestion Utilisateurs

```http
# Création utilisateur
POST /api/users
{
  "name": "Jean Dupont",
  "user_type": "farmer",
  "email": "jean@example.com",
  "hedera_account_id": "0.0.123456"
}

# Profil utilisateur
GET /api/users/{id}
```

### 🌾 Tokenisation RWA

```http
# Créer token RWA
POST /api/rwa/tokenize
{
  "asset_type": "wheat",
  "quantity": 1000,
  "quality_grade": "A",
  "harvest_date": "2024-09-15",
  "location": "coordinates"
}
```

### 💰 Gestion des Prêts

```http
# Créer demande de prêt
POST /api/loans
{
  "amount": 10000,
  "duration_days": 90,
  "collateral_token_id": "0.0.789012",
  "interest_rate": 850
}

# Financer un prêt
POST /api/loans/{id}/fund
{
  "lender_id": "user_id",
  "amount": 10000
}
```

## 🧪 Tests

### Tests Smart Contracts

```bash
cd contracts
npm test
```

### Tests Backend

```bash
cd backend
python -m pytest tests/
```

## 🚀 Déploiement

### Production Hedera Mainnet

```bash
# 1. Configuration mainnet
export HEDERA_NETWORK=mainnet

# 2. Déploiement contrats
npx hardhat deploy --network hedera-mainnet

# 3. Déploiement backend
docker build -t agrifund-backend .
docker run -p 5000:5000 agrifund-backend
```

## 🤝 Contribution

### Comment Contribuer

1. **Fork** le projet
2. Créer une **branche feature** (`git checkout -b feature/AmazingFeature`)
3. **Commit** vos changements (`git commit -m 'Add AmazingFeature'`)
4. **Push** vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrir une **Pull Request**

### Guidelines

- Suivre les conventions de code existantes
- Ajouter des tests pour les nouvelles fonctionnalités
- Mettre à jour la documentation
- Suivre les bonnes pratiques de sécurité

## 📄 Licence

Ce projet est sous licence MIT. Voir le fichier [LICENSE](LICENSE) pour plus de détails.

---

# 🇺🇸 English

## 📋 Table of Contents

- [🎯 Problem Statement](#-problem-statement-1)
- [💡 Solution](#-solution-1)
- [🏗️ Architecture](#️-architecture-1)
- [🚀 Features](#-features)
- [🔧 Tech Stack](#-tech-stack-1)
- [📱 User Interface](#-user-interface)
- [🛠️ Installation](#️-installation-1)
- [📚 API Documentation](#-api-documentation-1)
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

## 📄 License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

---

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

---

<div align="center">

**🌾 Building the future of decentralized agricultural finance together 🌾**

[![Hedera](https://img.shields.io/badge/Powered%20by-Hedera-blue)](https://hedera.com/)
[![DeFi](https://img.shields.io/badge/Category-DeFi-green)](https://defipulse.com/)
[![Agriculture](https://img.shields.io/badge/Sector-Agriculture-orange)](https://www.fao.org/)

*Democratizing access to credit for farmers worldwide via Hedera blockchain*

</div>
