// Enhanced Dashboard with Smart Empty States for Hedera AgriFund
class EnhancedDashboard {
    constructor(app) {
        this.app = app;
        this.userType = localStorage.getItem('userType') || 'farmer';
        this.currentLang = localStorage.getItem('language') || 'fr';
        this.emptyStateConfig = this.initEmptyStates();
    }

    // Initialize empty states configuration
    initEmptyStates() {
        return {
            farmer: {
                no_tokens: {
                    icon: '🌾',
                    title: {
                        fr: 'Aucune récolte digitalisée',
                        en: 'No crops digitized yet'
                    },
                    subtitle: {
                        fr: 'Créez votre premier reçu numérique pour débloquer du financement instantané',
                        en: 'Create your first digital receipt to unlock instant funding'
                    },
                    cta: {
                        fr: 'Créer mon premier reçu',
                        en: 'Create My First Receipt'
                    },
                    secondaryCta: {
                        fr: 'Voir la démo',
                        en: 'Watch Demo'
                    },
                    helpText: {
                        fr: 'Simple et sécurisé, en 4 étapes seulement',
                        en: 'Simple and secure, in just 4 steps'
                    },
                    illustration: 'farmer-empty.svg',
                    action: () => this.app.openTokenizeModal(),
                    secondaryAction: () => this.showDemo('tokenization')
                },
                no_loans: {
                    icon: '💰',
                    title: {
                        fr: 'Aucun financement actif',
                        en: 'No active funding'
                    },
                    subtitle: {
                        fr: 'Utilisez vos reçus numériques comme garantie pour obtenir des fonds',
                        en: 'Use your digital receipts as collateral to get funding'
                    },
                    cta: {
                        fr: 'Demander un prêt',
                        en: 'Request a Loan'
                    },
                    condition: () => this.hasTokens(),
                    conditionFailMessage: {
                        fr: 'Créez d\'abord un reçu numérique pour pouvoir demander un prêt',
                        en: 'Create a digital receipt first to request a loan'
                    },
                    action: () => this.hasTokens() ? this.app.openLoanModal() : this.showTokenizeFirst()
                },
                low_balance: {
                    icon: '⚠️',
                    title: {
                        fr: 'Solde faible',
                        en: 'Low Balance'
                    },
                    subtitle: {
                        fr: 'Votre solde est insuffisant pour les frais de transaction',
                        en: 'Your balance is insufficient for transaction fees'
                    },
                    cta: {
                        fr: 'Recharger le compte',
                        en: 'Add Funds'
                    }
                }
            },
            lender: {
                no_investments: {
                    icon: '📊',
                    title: {
                        fr: 'Portefeuille vide',
                        en: 'Empty Portfolio'
                    },
                    subtitle: {
                        fr: 'Découvrez des opportunités d\'investissement agricole sécurisées',
                        en: 'Discover secure agricultural investment opportunities'
                    },
                    cta: {
                        fr: 'Explorer les opportunités',
                        en: 'Explore Opportunities'
                    },
                    helpText: {
                        fr: 'Rendements attractifs dès 8% APR',
                        en: 'Attractive returns from 8% APR'
                    },
                    action: () => this.app.showPage('opportunities')
                }
            }
        };
    }

    // Render enhanced dashboard
    render() {
        const dashboardContainer = document.getElementById('dashboard');
        if (!dashboardContainer) return;

        const dashboardHTML = `
            <div class="enhanced-dashboard">
                <header class="dashboard-header">
                    <div class="header-content">
                        <h1>${this.getGreeting()}</h1>
                        <div class="dashboard-stats" id="dashboardStats">
                            ${this.renderQuickStats()}
                        </div>
                    </div>
                    <div class="header-actions">
                        ${this.renderQuickActions()}
                    </div>
                </header>

                <main class="dashboard-main">
                    <div class="dashboard-grid">
                        ${this.userType === 'farmer' ? this.renderFarmerDashboard() : this.renderLenderDashboard()}
                    </div>
                </main>
            </div>
        `;

        dashboardContainer.innerHTML = dashboardHTML;
        this.setupEventListeners();
        this.loadDashboardData();
    }

    // Get personalized greeting
    getGreeting() {
        const hour = new Date().getHours();
        const userName = this.app.currentUser?.name || 'Utilisateur';

        let greeting = '';
        if (hour < 12) {
            greeting = this.currentLang === 'fr' ? 'Bonjour' : 'Good morning';
        } else if (hour < 18) {
            greeting = this.currentLang === 'fr' ? 'Bon après-midi' : 'Good afternoon';
        } else {
            greeting = this.currentLang === 'fr' ? 'Bonsoir' : 'Good evening';
        }

        return `${greeting}, ${userName} !`;
    }

    // Render quick stats
    renderQuickStats() {
        if (this.userType === 'farmer') {
            return `
                <div class="stat-card">
                    <div class="stat-value" id="totalValue">--</div>
                    <div class="stat-label">Valeur totale</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value" id="activeLoans">--</div>
                    <div class="stat-label">Prêts actifs</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value" id="nextPayment">--</div>
                    <div class="stat-label">Prochaine échéance</div>
                </div>
            `;
        } else {
            return `
                <div class="stat-card">
                    <div class="stat-value" id="portfolioValue">--</div>
                    <div class="stat-label">Portefeuille</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value" id="monthlyReturn">--</div>
                    <div class="stat-label">Rendement mensuel</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value" id="activeInvestments">--</div>
                    <div class="stat-label">Investissements</div>
                </div>
            `;
        }
    }

    // Render quick actions
    renderQuickActions() {
        if (this.userType === 'farmer') {
            return `
                <button class="btn-primary quick-action" onclick="dashboard.openTokenizeModal()" aria-label="Créer un reçu numérique">
                    <i class="fas fa-plus" aria-hidden="true"></i>
                    Créer un reçu
                </button>
                <button class="btn-secondary quick-action" onclick="dashboard.openLoanModal()" aria-label="Demander un prêt" ${!this.hasTokens() ? 'disabled' : ''}>
                    <i class="fas fa-hand-holding-usd" aria-hidden="true"></i>
                    Demander un prêt
                </button>
            `;
        } else {
            return `
                <button class="btn-primary quick-action" onclick="dashboard.showOpportunities()" aria-label="Explorer les opportunités">
                    <i class="fas fa-search" aria-hidden="true"></i>
                    Explorer
                </button>
            `;
        }
    }

    // Render farmer dashboard
    renderFarmerDashboard() {
        return `
            <div class="dashboard-section">
                <div class="section-header">
                    <h2><i class="fas fa-seedling" aria-hidden="true"></i> Mes Récoltes Digitales</h2>
                    <button class="btn-link" onclick="dashboard.showAllTokens()">Voir tout</button>
                </div>
                <div class="section-content" id="tokensSection">
                    ${this.renderLoadingSkeleton('tokens')}
                </div>
            </div>

            <div class="dashboard-section">
                <div class="section-header">
                    <h2><i class="fas fa-coins" aria-hidden="true"></i> Mes Financements</h2>
                    <button class="btn-link" onclick="dashboard.showAllLoans()">Voir tout</button>
                </div>
                <div class="section-content" id="loansSection">
                    ${this.renderLoadingSkeleton('loans')}
                </div>
            </div>

            <div class="dashboard-section">
                <div class="section-header">
                    <h2><i class="fas fa-chart-line" aria-hidden="true"></i> Activité Récente</h2>
                </div>
                <div class="section-content" id="activitySection">
                    ${this.renderLoadingSkeleton('activity')}
                </div>
            </div>
        `;
    }

    // Render lender dashboard
    renderLenderDashboard() {
        return `
            <div class="dashboard-section">
                <div class="section-header">
                    <h2><i class="fas fa-chart-pie" aria-hidden="true"></i> Mon Portefeuille</h2>
                </div>
                <div class="section-content" id="portfolioSection">
                    ${this.renderLoadingSkeleton('portfolio')}
                </div>
            </div>

            <div class="dashboard-section">
                <div class="section-header">
                    <h2><i class="fas fa-fire" aria-hidden="true"></i> Opportunités Recommandées</h2>
                    <button class="btn-link" onclick="dashboard.showAllOpportunities()">Voir tout</button>
                </div>
                <div class="section-content" id="opportunitiesSection">
                    ${this.renderLoadingSkeleton('opportunities')}
                </div>
            </div>
        `;
    }

    // Render loading skeleton
    renderLoadingSkeleton(type) {
        const skeletonCount = type === 'activity' ? 3 : 2;
        return `
            <div class="loading-skeleton">
                ${Array(skeletonCount).fill().map(() => `
                    <div class="skeleton-card">
                        <div class="skeleton-header">
                            <div class="skeleton-circle"></div>
                            <div class="skeleton-text"></div>
                        </div>
                        <div class="skeleton-content">
                            <div class="skeleton-text long"></div>
                            <div class="skeleton-text medium"></div>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    }

    // Render smart empty state
    renderEmptyState(container, stateKey, additionalData = {}) {
        const config = this.emptyStateConfig[this.userType]?.[stateKey];
        if (!config) return;

        const lang = this.currentLang;

        // Check condition if exists
        if (config.condition && !config.condition()) {
            container.innerHTML = `
                <div class="empty-state condition-failed">
                    <div class="empty-icon">${config.icon}</div>
                    <div class="empty-content">
                        <h3>${config.title[lang]}</h3>
                        <p class="condition-message">${config.conditionFailMessage[lang]}</p>
                        <button class="btn-primary" onclick="${config.action ? 'config.action()' : 'void(0)'}">
                            ${this.emptyStateConfig.farmer.no_tokens.cta[lang]}
                        </button>
                    </div>
                </div>
            `;
            return;
        }

        container.innerHTML = `
            <div class="empty-state" role="region" aria-labelledby="empty-state-title">
                <div class="empty-illustration">
                    ${config.illustration ? 
                        `<img src="assets/illustrations/${config.illustration}" alt="" aria-hidden="true">` :
                        `<div class="empty-icon">${config.icon}</div>`
                    }
                </div>
                <div class="empty-content">
                    <h3 id="empty-state-title">${config.title[lang]}</h3>
                    <p>${config.subtitle[lang]}</p>
                    ${config.helpText ? `<small class="help-text">${config.helpText[lang]}</small>` : ''}
                </div>
                <div class="empty-actions">
                    <button class="btn-primary" onclick="dashboard.handleEmptyAction('${stateKey}')" 
                            aria-label="${config.cta[lang]}">
                        ${config.cta[lang]}
                    </button>
                    ${config.secondaryCta ? `
                        <button class="btn-secondary" onclick="dashboard.handleSecondaryAction('${stateKey}')"
                                aria-label="${config.secondaryCta[lang]}">
                            ${config.secondaryCta[lang]}
                        </button>
                    ` : ''}
                </div>
            </div>
        `;
    }

    // Handle empty state actions
    handleEmptyAction(stateKey) {
        const config = this.emptyStateConfig[this.userType]?.[stateKey];
        if (config?.action) {
            config.action();
        }
    }

    // Handle secondary actions
    handleSecondaryAction(stateKey) {
        const config = this.emptyStateConfig[this.userType]?.[stateKey];
        if (config?.secondaryAction) {
            config.secondaryAction();
        }
    }

    // Load dashboard data
    async loadDashboardData() {
        try {
            // Load user data based on type
            if (this.userType === 'farmer') {
                await this.loadFarmerData();
            } else {
                await this.loadLenderData();
            }
        } catch (error) {
            console.error('Error loading dashboard data:', error);
            this.showError('Erreur lors du chargement des données');
        }
    }

    // Load farmer specific data
    async loadFarmerData() {
        // Load tokens
        const tokens = await this.fetchUserTokens();
        this.renderTokensSection(tokens);

        // Load loans
        const loans = await this.fetchUserLoans();
        this.renderLoansSection(loans);

        // Load activity
        const activity = await this.fetchRecentActivity();
        this.renderActivitySection(activity);

        // Update stats
        this.updateFarmerStats(tokens, loans);
    }

    // Load lender specific data
    async loadLenderData() {
        // Load portfolio
        const portfolio = await this.fetchPortfolio();
        this.renderPortfolioSection(portfolio);

        // Load opportunities
        const opportunities = await this.fetchOpportunities();
        this.renderOpportunitiesSection(opportunities);

        // Update stats
        this.updateLenderStats(portfolio);
    }

    // Render tokens section
    renderTokensSection(tokens) {
        const container = document.getElementById('tokensSection');

        if (!tokens || tokens.length === 0) {
            this.renderEmptyState(container, 'no_tokens');
            return;
        }

        container.innerHTML = `
            <div class="cards-grid">
                ${tokens.slice(0, 3).map(token => `
                    <div class="token-card" onclick="dashboard.showTokenDetails('${token.id}')">
                        <div class="card-header">
                            <div class="token-icon">${this.getCropIcon(token.cropType)}</div>
                            <div class="token-info">
                                <h4>${token.cropType}</h4>
                                <span class="token-quantity">${token.quantity}kg</span>
                            </div>
                        </div>
                        <div class="card-body">
                            <div class="token-value">
                                <span class="current-value">$${token.currentValue.toLocaleString()}</span>
                                <span class="value-change ${token.change >= 0 ? 'positive' : 'negative'}">
                                    ${token.change >= 0 ? '+' : ''}${token.change.toFixed(1)}%
                                </span>
                            </div>
                            <div class="token-status">
                                <span class="status-badge ${token.status}">${this.getStatusLabel(token.status)}</span>
                            </div>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    }

    // Render loans section
    renderLoansSection(loans) {
        const container = document.getElementById('loansSection');

        if (!loans || loans.length === 0) {
            this.renderEmptyState(container, 'no_loans');
            return;
        }

        container.innerHTML = `
            <div class="cards-grid">
                ${loans.slice(0, 3).map(loan => `
                    <div class="loan-card" onclick="dashboard.showLoanDetails('${loan.id}')">
                        <div class="card-header">
                            <h4>Prêt #${loan.id.slice(-6)}</h4>
                            <span class="loan-amount">$${loan.amount.toLocaleString()}</span>
                        </div>
                        <div class="card-body">
                            <div class="loan-progress">
                                <div class="progress-bar">
                                    <div class="progress-fill" style="width: ${loan.repaymentProgress}%"></div>
                                </div>
                                <span>${loan.repaymentProgress}% remboursé</span>
                            </div>
                            <div class="loan-next-payment">
                                <small>Prochaine échéance: ${new Date(loan.nextPayment).toLocaleDateString()}</small>
                            </div>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    }

    // Setup event listeners
    setupEventListeners() {
        // Refresh button
        const refreshBtn = document.querySelector('.refresh-btn');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => this.refreshData());
        }
    }

    // Utility methods
    hasTokens() {
        // Check if user has any tokens (implement based on your data structure)
        return this.app.userTokens && this.app.userTokens.length > 0;
    }

    getCropIcon(cropType) {
        const icons = {
            'maize': '🌽',
            'coffee': '☕',
            'rice': '🌾',
            'wheat': '🌾',
            'beans': '🫘'
        };
        return icons[cropType?.toLowerCase()] || '🌱';
    }

    getStatusLabel(status) {
        const labels = {
            'active': 'Actif',
            'pending': 'En attente',
            'completed': 'Terminé',
            'expired': 'Expiré'
        };
        return labels[status] || status;
    }

    // Mock data fetchers (replace with real API calls)
    async fetchUserTokens() {
        await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
        return this.app.mockData?.tokens || [];
    }

    async fetchUserLoans() {
        await new Promise(resolve => setTimeout(resolve, 1200));
        return this.app.mockData?.loans || [];
    }

    async fetchRecentActivity() {
        await new Promise(resolve => setTimeout(resolve, 800));
        return this.app.mockData?.activity || [];
    }
}

// Global dashboard instance
window.dashboard = null;

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    // Will be initialized by main app
});
