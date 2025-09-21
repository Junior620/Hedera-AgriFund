// Main Application Logic for Hedera AgriFund - Enhanced Version
class HederaAgriFundApp {
    constructor() {
        this.hedera = new HederaIntegration();
        this.web3 = new Web3Integration();
        this.currentUser = null;
        this.userType = 'farmer';
        this.mockData = this.initializeMockData();
        this.currentLanguage = 'fr'; // Default to French
        this.theme = 'light';
        this.notifications = [];
        this.isLoading = false;

        // Initialize language manager
        this.languageManager = new LanguageManager();
    }

    // Initialize the application
    async init() {
        try {
            console.log('Initializing Hedera AgriFund...');
            this.showLoadingOverlay(true);

            // Initialize integrations
            await this.hedera.init();
            await this.web3.init();

            // Setup event listeners
            this.setupEventListeners();
            this.setupFormValidation();
            this.setupLanguageToggle();
            this.setupThemeToggle();

            // Load initial data
            this.loadInitialData();
            this.updateUI();
            this.populateDropdowns();

            // Initialize tooltips and help system
            this.initializeTooltips();
            this.initializeHelpSystem();

            this.showLoadingOverlay(false);
            this.showNotification('Application initialisée avec succès!', 'success');
            console.log('Application initialized successfully');
        } catch (error) {
            this.showLoadingOverlay(false);
            this.showNotification('Erreur d\'initialisation de l\'application', 'error');
            console.error('Application initialization failed:', error);
        }
    }

    // Enhanced Mock Data with more realistic entries
    initializeMockData() {
        return {
            farmers: [
                {
                    id: '0.0.123456',
                    name: 'Jean Kimani',
                    location: 'Nakuru, Kenya',
                    creditScore: 785,
                    totalCollateral: 15000,
                    activeLoans: 2,
                    tokens: [
                        { id: 'token_001', type: 'maize', quantity: 1000, grade: 'A', value: 8000 },
                        { id: 'token_002', type: 'coffee', quantity: 500, grade: 'A', value: 12000 }
                    ],
                    recentActivity: [
                        { type: 'tokenize', description: 'Tokenisation de 1000kg de maïs', time: '2024-01-20T10:30:00Z', icon: 'coins' },
                        { type: 'loan', description: 'Prêt de $5000 approuvé', time: '2024-01-18T14:15:00Z', icon: 'money-bill-wave' },
                        { type: 'payment', description: 'Remboursement de $650', time: '2024-01-15T09:45:00Z', icon: 'credit-card' }
                    ]
                }
            ],
            lenders: [
                {
                    id: '0.0.654321',
                    name: 'Sarah Johnson',
                    portfolioValue: 125430,
                    activeInvestments: 23,
                    monthlyReturn: 8.2,
                    riskProfile: 'moderate',
                    investments: [
                        { loanId: 'loan_001', amount: 2000, expectedReturn: 8.5, status: 'active' },
                        { loanId: 'loan_003', amount: 3000, expectedReturn: 8.8, status: 'pending' }
                    ]
                }
            ],
            loans: [
                {
                    id: 'loan_001',
                    borrower: 'Jean Kimani',
                    borrowerId: '0.0.123456',
                    amount: 5000,
                    purpose: 'Semences et intrants',
                    interestRate: 8.5,
                    duration: 6,
                    status: 'funded',
                    collateral: {
                        type: 'maize',
                        quantity: 1000,
                        grade: 'A',
                        tokenId: '0.0.789012'
                    },
                    ltv: 75,
                    createdAt: '2024-01-15',
                    fundingProgress: 100,
                    monthlyPayment: 890,
                    nextPaymentDue: '2024-02-15',
                    description: 'Financement pour l\'achat de semences hybrides et d\'engrais pour la saison de plantation 2024.'
                },
                {
                    id: 'loan_002',
                    borrower: 'Marie Wanjiku',
                    borrowerId: '0.0.123457',
                    amount: 3000,
                    purpose: 'Équipement agricole',
                    interestRate: 9.0,
                    duration: 12,
                    status: 'pending',
                    collateral: {
                        type: 'coffee',
                        quantity: 500,
                        grade: 'A',
                        tokenId: '0.0.789013'
                    },
                    ltv: 70,
                    createdAt: '2024-01-20',
                    fundingProgress: 45,
                    monthlyPayment: 275,
                    description: 'Achat d\'une motopompe pour améliorer l\'irrigation des plantations de café.'
                },
                {
                    id: 'loan_003',
                    borrower: 'Pierre Mwangi',
                    borrowerId: '0.0.123458',
                    amount: 7500,
                    purpose: 'Système d\'irrigation',
                    interestRate: 8.8,
                    duration: 9,
                    status: 'pending',
                    collateral: {
                        type: 'wheat',
                        quantity: 800,
                        grade: 'B',
                        tokenId: '0.0.789014'
                    },
                    ltv: 72,
                    createdAt: '2024-01-22',
                    fundingProgress: 20,
                    monthlyPayment: 895,
                    description: 'Installation d\'un système d\'irrigation goutte-à-goutte pour optimiser la production.'
                }
            ],
            tokens: [
                {
                    id: 'token_001',
                    type: 'maize',
                    quantity: 1000,
                    grade: 'A',
                    location: 'Entrepôt Nakuru Coop',
                    value: 8000,
                    status: 'available',
                    pledged: false,
                    harvestDate: '2024-01-10',
                    expiryDate: '2024-07-10',
                    certificates: ['organic', 'quality_assured']
                },
                {
                    id: 'token_002',
                    type: 'coffee',
                    quantity: 500,
                    grade: 'A',
                    location: 'Entrepôt Kiambu Central',
                    value: 12000,
                    status: 'pledged',
                    pledged: true,
                    loanId: 'loan_001',
                    harvestDate: '2024-01-05',
                    expiryDate: '2025-01-05'
                }
            ],
            cropPrices: {
                maize: { current: 8.0, change: 2.5, currency: 'USD/kg' },
                coffee: { current: 24.0, change: -1.2, currency: 'USD/kg' },
                wheat: { current: 9.5, change: 0.8, currency: 'USD/kg' },
                rice: { current: 12.0, change: 1.5, currency: 'USD/kg' },
                cocoa: { current: 45.0, change: 3.2, currency: 'USD/kg' }
            }
        };
    }

    // Enhanced Event Listeners Setup
    setupEventListeners() {
        // Navigation events
        document.addEventListener('DOMContentLoaded', () => {
            // Mobile menu toggle
            const navToggle = document.querySelector('.nav-toggle');
            if (navToggle) {
                navToggle.addEventListener('click', this.toggleMobileMenu.bind(this));
            }

            // Connect wallet button
            const connectBtn = document.getElementById('connectWallet');
            if (connectBtn) {
                connectBtn.addEventListener('click', this.connectWallet.bind(this));
            }

            // User type toggle buttons
            document.querySelectorAll('.btn-toggle').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const userType = e.target.textContent.toLowerCase().includes('farmer') ? 'farmer' : 'lender';
                    this.switchUserType(userType);
                });
            });

            // Form submissions
            const tokenizeForm = document.getElementById('tokenizeForm');
            if (tokenizeForm) {
                tokenizeForm.addEventListener('submit', this.handleTokenizeSubmit.bind(this));
            }

            const loanForm = document.getElementById('loanForm');
            if (loanForm) {
                loanForm.addEventListener('submit', this.handleLoanSubmit.bind(this));
            }

            // Real-time form validation
            this.setupRealTimeValidation();

            // Dropdown events
            this.setupDropdownEvents();

            // Search functionality
            this.setupSearchFunctionality();
        });

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey || e.metaKey) {
                switch(e.key) {
                    case 'h':
                        e.preventDefault();
                        this.showPage('home');
                        break;
                    case 'd':
                        e.preventDefault();
                        this.showPage('dashboard');
                        break;
                    case 'l':
                        e.preventDefault();
                        this.showPage('loans');
                        break;
                    case 't':
                        e.preventDefault();
                        this.showPage('tokens');
                        break;
                }
            }

            // Escape key closes modals
            if (e.key === 'Escape') {
                this.closeAllModals();
            }
        });
    }

    // Enhanced Form Validation
    setupFormValidation() {
        const forms = document.querySelectorAll('form');
        forms.forEach(form => {
            const inputs = form.querySelectorAll('input, select, textarea');
            inputs.forEach(input => {
                input.addEventListener('blur', () => this.validateField(input));
                input.addEventListener('input', () => this.clearFieldError(input));
            });
        });
    }

    validateField(field) {
        const formGroup = field.closest('.form-group');
        const isRequired = field.hasAttribute('required');
        const fieldType = field.type;
        const fieldValue = field.value.trim();

        let isValid = true;
        let errorMessage = '';

        // Required field validation
        if (isRequired && !fieldValue) {
            isValid = false;
            errorMessage = 'Ce champ est obligatoire';
        }

        // Type-specific validation
        if (fieldValue) {
            switch(fieldType) {
                case 'email':
                    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                    if (!emailRegex.test(fieldValue)) {
                        isValid = false;
                        errorMessage = 'Veuillez entrer un email valide';
                    }
                    break;
                case 'number':
                    const min = parseFloat(field.getAttribute('min'));
                    const max = parseFloat(field.getAttribute('max'));
                    const value = parseFloat(fieldValue);

                    if (isNaN(value)) {
                        isValid = false;
                        errorMessage = 'Veuillez entrer un nombre valide';
                    } else if (min !== null && value < min) {
                        isValid = false;
                        errorMessage = `La valeur doit être d'au moins ${min}`;
                    } else if (max !== null && value > max) {
                        isValid = false;
                        errorMessage = `La valeur ne peut pas dépasser ${max}`;
                    }
                    break;
            }
        }

        // Custom validation for specific fields
        if (field.id === 'cropQuantity' && fieldValue) {
            const quantity = parseFloat(fieldValue);
            if (quantity < 100) {
                isValid = false;
                errorMessage = 'La quantité minimum est de 100kg';
            }
        }

        if (field.id === 'loanAmount' && fieldValue) {
            const amount = parseFloat(fieldValue);
            if (amount < 100 || amount > 50000) {
                isValid = false;
                errorMessage = 'Le montant doit être entre $100 et $50,000';
            }
        }

        // Update UI based on validation
        if (isValid) {
            formGroup.classList.remove('error');
            field.style.borderColor = '#28a745';
        } else {
            formGroup.classList.add('error');
            const errorElement = formGroup.querySelector('.validation-message');
            if (errorElement) {
                errorElement.textContent = errorMessage;
            }
        }

        return isValid;
    }

    clearFieldError(field) {
        const formGroup = field.closest('.form-group');
        formGroup.classList.remove('error');
        field.style.borderColor = '';
    }

    // Real-time updates for form calculations
    setupRealTimeValidation() {
        // Tokenize form real-time calculations
        const cropTypeField = document.getElementById('cropType');
        const cropQuantityField = document.getElementById('cropQuantity');
        const qualityGradeField = document.getElementById('qualityGrade');

        if (cropTypeField && cropQuantityField && qualityGradeField) {
            [cropTypeField, cropQuantityField, qualityGradeField].forEach(field => {
                field.addEventListener('input', this.updateTokenizationEstimate.bind(this));
            });
        }

        // Loan form real-time calculations
        const loanAmountField = document.getElementById('loanAmount');
        const repaymentPeriodField = document.getElementById('repaymentPeriod');

        if (loanAmountField && repaymentPeriodField) {
            [loanAmountField, repaymentPeriodField].forEach(field => {
                field.addEventListener('input', this.updateLoanSummary.bind(this));
            });
        }
    }

    // Update tokenization estimate in real-time
    updateTokenizationEstimate() {
        const cropType = document.getElementById('cropType')?.value;
        const quantity = parseFloat(document.getElementById('cropQuantity')?.value) || 0;
        const grade = document.getElementById('qualityGrade')?.value;

        if (cropType && quantity && grade) {
            const priceData = this.mockData.cropPrices[cropType];
            if (priceData) {
                let basePrice = priceData.current;

                // Grade multiplier
                const gradeMultipliers = { 'A': 1.1, 'B': 1.0, 'C': 0.9 };
                const gradeMultiplier = gradeMultipliers[grade] || 1.0;

                const estimatedValue = quantity * basePrice * gradeMultiplier;
                const maxLoanAmount = estimatedValue * 0.75; // 75% LTV

                const estimatedDisplay = document.getElementById('estimatedValueDisplay');
                const estimatedValueSpan = document.getElementById('estimatedValue');
                const maxLoanSpan = document.getElementById('maxLoanAmount');

                if (estimatedDisplay && estimatedValueSpan && maxLoanSpan) {
                    estimatedValueSpan.textContent = `$${estimatedValue.toFixed(2)}`;
                    maxLoanSpan.textContent = `$${maxLoanAmount.toFixed(2)}`;
                    estimatedDisplay.style.display = 'block';
                }
            }
        }
    }

    // Update loan summary in real-time
    updateLoanSummary() {
        const amount = parseFloat(document.getElementById('loanAmount')?.value) || 0;
        const period = parseInt(document.getElementById('repaymentPeriod')?.value) || 12;

        if (amount > 0) {
            const interestRate = 8.5; // Base interest rate
            const monthlyRate = interestRate / 100 / 12;
            const monthlyPayment = (amount * monthlyRate * Math.pow(1 + monthlyRate, period)) /
                                 (Math.pow(1 + monthlyRate, period) - 1);
            const totalRepayment = monthlyPayment * period;

            const summaryDisplay = document.getElementById('loanSummaryDisplay');
            const monthlyPaymentSpan = document.getElementById('monthlyPayment');
            const totalRepaymentSpan = document.getElementById('totalRepayment');

            if (summaryDisplay && monthlyPaymentSpan && totalRepaymentSpan) {
                monthlyPaymentSpan.textContent = `$${monthlyPayment.toFixed(2)}`;
                totalRepaymentSpan.textContent = `$${totalRepayment.toFixed(2)}`;
                summaryDisplay.style.display = 'block';
            }
        }
    }

    // Enhanced notification system
    showNotification(message, type = 'info', duration = 5000) {
        const container = document.getElementById('notificationContainer');
        if (!container) return;

        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;

        const icon = this.getNotificationIcon(type);
        notification.innerHTML = `
            <i class="fas ${icon}"></i>
            <span>${message}</span>
            <button onclick="this.parentElement.remove()">
                <i class="fas fa-times"></i>
            </button>
        `;

        container.appendChild(notification);

        // Auto-remove after duration
        setTimeout(() => {
            if (notification.parentElement) {
                notification.remove();
            }
        }, duration);
    }

    getNotificationIcon(type) {
        const icons = {
            success: 'fa-check-circle',
            error: 'fa-exclamation-circle',
            warning: 'fa-exclamation-triangle',
            info: 'fa-info-circle'
        };
        return icons[type] || icons.info;
    }

    // Loading overlay management
    showLoadingOverlay(show, message = 'Traitement en cours...') {
        const overlay = document.getElementById('loadingOverlay');
        if (overlay) {
            if (show) {
                overlay.querySelector('p').textContent = message;
                overlay.classList.remove('hidden');
                overlay.classList.add('active');
            } else {
                overlay.classList.add('hidden');
                overlay.classList.remove('active');
            }
        }
        this.isLoading = show;
    }

    // Enhanced modal management
    openModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.add('show');
            modal.style.display = 'flex';
            document.body.style.overflow = 'hidden';

            // Focus first input
            const firstInput = modal.querySelector('input, select, textarea');
            if (firstInput) {
                setTimeout(() => firstInput.focus(), 100);
            }
        }
    }

    closeModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.remove('show');
            modal.style.display = 'none';
            document.body.style.overflow = '';

            // Clear form if it exists
            const form = modal.querySelector('form');
            if (form) {
                form.reset();
                // Clear validation states
                form.querySelectorAll('.form-group').forEach(group => {
                    group.classList.remove('error');
                });
                // Hide summary displays
                const summaryDisplays = modal.querySelectorAll('.loan-summary, .estimated-value');
                summaryDisplays.forEach(display => {
                    display.style.display = 'none';
                });
            }
        }
    }

    closeAllModals() {
        document.querySelectorAll('.modal').forEach(modal => {
            modal.classList.remove('show');
            modal.style.display = 'none';
        });
        document.body.style.overflow = '';
    }

    // Enhanced dashboard updates
    updateUI() {
        this.updateUserInfo();
        this.updateDashboard();
        this.updateNavigation();
        this.renderLoans();
        this.renderTokens();
        this.updateLanguageElements();
    }

    updateUserInfo() {
        const userAddressElement = document.getElementById('userAddress');
        if (userAddressElement && this.currentUser) {
            userAddressElement.textContent = this.currentUser.name || 'Utilisateur connecté';
        }
    }

    updateDashboard() {
        if (this.userType === 'farmer') {
            this.updateFarmerDashboard();
        } else {
            this.updateLenderDashboard();
        }
    }

    updateFarmerDashboard() {
        const farmer = this.mockData.farmers[0];

        // Update metrics
        const totalCollateralEl = document.getElementById('totalCollateral');
        const activeLoansEl = document.getElementById('activeLoans');
        const creditScoreEl = document.getElementById('creditScore');

        if (totalCollateralEl) totalCollateralEl.textContent = `$${farmer.totalCollateral.toLocaleString()}`;
        if (activeLoansEl) activeLoansEl.textContent = farmer.activeLoans;
        if (creditScoreEl) creditScoreEl.textContent = farmer.creditScore;

        // Update recent activity
        this.renderRecentActivity(farmer.recentActivity);
    }

    updateLenderDashboard() {
        const lender = this.mockData.lenders[0];

        // Update metrics
        const totalInvestedEl = document.getElementById('totalInvested');
        const activeInvestmentsEl = document.getElementById('activeInvestments');
        const monthlyReturnEl = document.getElementById('monthlyReturn');

        if (totalInvestedEl) totalInvestedEl.textContent = `$${lender.portfolioValue.toLocaleString()}`;
        if (activeInvestmentsEl) activeInvestmentsEl.textContent = lender.activeInvestments;
        if (monthlyReturnEl) monthlyReturnEl.textContent = `${lender.monthlyReturn}%`;

        // Update investment opportunities
        this.renderTopOpportunities();
    }

    renderRecentActivity(activities) {
        const activityList = document.getElementById('recentActivity');
        if (!activityList || !activities) return;

        activityList.innerHTML = activities.map(activity => `
            <div class="activity-item">
                <div class="activity-icon">
                    <i class="fas fa-${activity.icon}"></i>
                </div>
                <div class="activity-content">
                    <div class="activity-title">${activity.description}</div>
                    <div class="activity-time">${this.formatDateTime(activity.time)}</div>
                </div>
            </div>
        `).join('');
    }

    renderTopOpportunities() {
        const opportunitiesContainer = document.getElementById('topOpportunities');
        if (!opportunitiesContainer) return;

        const pendingLoans = this.mockData.loans.filter(loan => loan.status === 'pending').slice(0, 3);

        opportunitiesContainer.innerHTML = pendingLoans.map(loan => `
            <div class="opportunity-item" data-loan-id="${loan.id}">
                <div class="opportunity-header">
                    <h4>${loan.borrower}</h4>
                    <span class="amount">$${loan.amount.toLocaleString()}</span>
                </div>
                <div class="opportunity-details">
                    <div class="detail-item">
                        <span class="label">Taux:</span>
                        <span class="value">${loan.interestRate}% APR</span>
                    </div>
                    <div class="detail-item">
                        <span class="label">Durée:</span>
                        <span class="value">${loan.duration} mois</span>
                    </div>
                    <div class="detail-item">
                        <span class="label">Garantie:</span>
                        <span class="value">${loan.collateral.quantity}kg ${loan.collateral.type}</span>
                    </div>
                </div>
                <div class="funding-progress">
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${loan.fundingProgress}%"></div>
                    </div>
                    <span class="progress-text">${loan.fundingProgress}% financé</span>
                </div>
                <button class="btn-primary btn-invest" onclick="investInLoan('${loan.id}')">
                    <i class="fas fa-hand-holding-usd"></i> Investir
                </button>
            </div>
        `).join('');
    }

    // Enhanced form submissions
    async handleTokenizeSubmit(event) {
        event.preventDefault();

        if (this.isLoading) return;

        const form = document.getElementById('tokenizeForm');
        const formData = new FormData(form);

        // Validate all fields
        const inputs = form.querySelectorAll('input, select');
        let isValid = true;

        inputs.forEach(input => {
            if (!this.validateField(input)) {
                isValid = false;
            }
        });

        if (!isValid) {
            this.showNotification('Veuillez corriger les erreurs dans le formulaire', 'error');
            return;
        }

        try {
            this.showLoadingOverlay(true, 'Création du reçu numérique...');

            // Simulate API call
            await this.simulateApiCall(2000);

            const tokenData = {
                type: document.getElementById('cropType').value,
                quantity: parseFloat(document.getElementById('cropQuantity').value),
                grade: document.getElementById('qualityGrade').value,
                location: document.getElementById('warehouseLocation').value,
                harvestDate: document.getElementById('harvestDate').value
            };

            // Add to mock data
            const newToken = {
                id: `token_${Date.now()}`,
                ...tokenData,
                value: this.calculateTokenValue(tokenData),
                status: 'available',
                pledged: false,
                createdAt: new Date().toISOString()
            };

            this.mockData.tokens.push(newToken);

            this.showLoadingOverlay(false);
            this.closeModal('tokenizeModal');
            this.showNotification('Reçu numérique créé avec succès!', 'success');

            // Update UI
            this.renderTokens();
            this.updateDashboard();

        } catch (error) {
            this.showLoadingOverlay(false);
            this.showNotification('Erreur lors de la création du reçu', 'error');
            console.error('Tokenization error:', error);
        }
    }

    async handleLoanSubmit(event) {
        event.preventDefault();

        if (this.isLoading) return;

        const form = document.getElementById('loanForm');

        // Validate all fields
        const inputs = form.querySelectorAll('input, select');
        let isValid = true;

        inputs.forEach(input => {
            if (!this.validateField(input)) {
                isValid = false;
            }
        });

        if (!isValid) {
            this.showNotification('Veuillez corriger les erreurs dans le formulaire', 'error');
            return;
        }

        try {
            this.showLoadingOverlay(true, 'Traitement de la demande de prêt...');

            // Simulate API call
            await this.simulateApiCall(3000);

            const loanData = {
                amount: parseFloat(document.getElementById('loanAmount').value),
                collateralToken: document.getElementById('collateralToken').value,
                purpose: document.getElementById('loanPurpose').value,
                duration: parseInt(document.getElementById('repaymentPeriod').value)
            };

            // Add to mock data
            const newLoan = {
                id: `loan_${Date.now()}`,
                borrower: this.mockData.farmers[0].name,
                borrowerId: this.mockData.farmers[0].id,
                ...loanData,
                interestRate: 8.5,
                status: 'pending',
                ltv: 75,
                createdAt: new Date().toISOString().split('T')[0],
                fundingProgress: 0
            };

            this.mockData.loans.push(newLoan);

            this.showLoadingOverlay(false);
            this.closeModal('loanModal');
            this.showNotification('Demande de prêt soumise avec succès!', 'success');

            // Update UI
            this.renderLoans();
            this.updateDashboard();

        } catch (error) {
            this.showLoadingOverlay(false);
            this.showNotification('Erreur lors de la soumission de la demande', 'error');
            console.error('Loan submission error:', error);
        }
    }

    // Utility functions
    calculateTokenValue(tokenData) {
        const priceData = this.mockData.cropPrices[tokenData.type];
        if (!priceData) return 0;

        const gradeMultipliers = { 'A': 1.1, 'B': 1.0, 'C': 0.9 };
        const gradeMultiplier = gradeMultipliers[tokenData.grade] || 1.0;

        return tokenData.quantity * priceData.current * gradeMultiplier;
    }

    formatDateTime(dateString) {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now - date;
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

        if (diffDays === 0) {
            return "Aujourd'hui";
        } else if (diffDays === 1) {
            return "Hier";
        } else if (diffDays < 7) {
            return `Il y a ${diffDays} jours`;
        } else {
            return date.toLocaleDateString('fr-FR');
        }
    }

    simulateApiCall(delay) {
        return new Promise(resolve => setTimeout(resolve, delay));
    }

    // Continue with remaining methods...
    // This is part 1 of the enhanced JavaScript

    // Page Navigation System
    showPage(pageId) {
        // Hide all pages
        document.querySelectorAll('.page').forEach(page => {
            page.classList.remove('active');
        });

        // Show selected page
        const targetPage = document.getElementById(pageId);
        if (targetPage) {
            targetPage.classList.add('active');
        }

        // Update navigation
        this.updateNavigation(pageId);

        // Load page-specific data
        this.loadPageData(pageId);
    }

    updateNavigation(activePageId) {
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
        });

        const activeLink = document.querySelector(`.nav-link[onclick*="${activePageId}"]`);
        if (activeLink) {
            activeLink.classList.add('active');
        }
    }

    loadPageData(pageId) {
        switch(pageId) {
            case 'dashboard':
                this.updateDashboard();
                break;
            case 'loans':
                this.renderLoans();
                break;
            case 'tokens':
                this.renderTokens();
                break;
            case 'analytics':
                this.renderAnalytics();
                break;
            case 'calculator':
                this.renderCalculator();
                break;
        }
    }

    // User Type Switching
    switchUserType(userType) {
        this.userType = userType;

        // Update toggle buttons
        document.querySelectorAll('.btn-toggle').forEach(btn => {
            btn.classList.remove('active');
        });

        const activeBtn = Array.from(document.querySelectorAll('.btn-toggle'))
            .find(btn => btn.textContent.toLowerCase().includes(userType));
        if (activeBtn) {
            activeBtn.classList.add('active');
        }

        // Show/hide dashboard content
        const farmerDashboard = document.getElementById('farmer-dashboard');
        const lenderDashboard = document.getElementById('lender-dashboard');

        if (userType === 'farmer') {
            farmerDashboard?.classList.add('active');
            lenderDashboard?.classList.remove('active');
        } else {
            lenderDashboard?.classList.add('active');
            farmerDashboard?.classList.remove('active');
        }

        this.updateDashboard();
    }

    // Enhanced Wallet Connection
    async connectWallet() {
        try {
            this.showLoadingOverlay(true, 'Connexion au portefeuille...');

            // Simulate wallet connection
            await this.simulateApiCall(1500);

            this.currentUser = {
                id: '0.0.123456',
                name: 'Jean Kimani',
                address: '0x742d35Cc6a1D4532d24C4a01Bfb41534baD54E7D',
                balance: 125.50
            };

            // Update UI
            const connectBtn = document.getElementById('connectWallet');
            if (connectBtn) {
                connectBtn.textContent = 'Portefeuille Connecté';
                connectBtn.classList.add('connected');
                connectBtn.disabled = true;
            }

            this.updateUserInfo();
            this.showLoadingOverlay(false);
            this.showNotification('Portefeuille connecté avec succès!', 'success');

        } catch (error) {
            this.showLoadingOverlay(false);
            this.showNotification('Erreur de connexion au portefeuille', 'error');
            console.error('Wallet connection error:', error);
        }
    }

    // Render Functions
    renderLoans() {
        const loansGrid = document.getElementById('loansGrid');
        if (!loansGrid) return;

        const filteredLoans = this.getFilteredLoans();

        if (filteredLoans.length === 0) {
            loansGrid.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-money-bill-wave"></i>
                    <h3>Aucun prêt trouvé</h3>
                    <p>Aucun prêt ne correspond à vos critères de recherche.</p>
                    <button class="btn-primary" onclick="app.openModal('loanModal')">
                        <i class="fas fa-plus"></i> Créer une demande
                    </button>
                </div>
            `;
            return;
        }

        loansGrid.innerHTML = filteredLoans.map(loan => this.renderLoanCard(loan)).join('');
    }

    renderLoanCard(loan) {
        const statusClass = {
            'pending': 'status-pending',
            'funded': 'status-funded',
            'repaid': 'status-repaid',
            'defaulted': 'status-defaulted'
        };

        const statusText = {
            'pending': 'En attente',
            'funded': 'Financé',
            'repaid': 'Remboursé',
            'defaulted': 'Défaillant'
        };

        return `
            <div class="loan-card" data-loan-id="${loan.id}">
                <div class="loan-header">
                    <div class="borrower-info">
                        <h3>${loan.borrower}</h3>
                        <span class="loan-purpose">${loan.purpose}</span>
                    </div>
                    <div class="loan-status ${statusClass[loan.status]}">
                        ${statusText[loan.status]}
                    </div>
                </div>
                
                <div class="loan-details">
                    <div class="loan-amount">
                        <span class="label">Montant:</span>
                        <span class="value">$${loan.amount.toLocaleString()}</span>
                    </div>
                    <div class="loan-rate">
                        <span class="label">Taux:</span>
                        <span class="value">${loan.interestRate}% APR</span>
                    </div>
                    <div class="loan-duration">
                        <span class="label">Durée:</span>
                        <span class="value">${loan.duration} mois</span>
                    </div>
                    <div class="loan-ltv">
                        <span class="label">LTV:</span>
                        <span class="value">${loan.ltv}%</span>
                    </div>
                </div>

                <div class="collateral-info">
                    <h4><i class="fas fa-shield-alt"></i> Garantie</h4>
                    <div class="collateral-details">
                        <span class="crop-type">${loan.collateral.quantity}kg ${loan.collateral.type}</span>
                        <span class="crop-grade">Grade ${loan.collateral.grade}</span>
                    </div>
                </div>

                ${loan.status === 'pending' ? `
                    <div class="funding-progress">
                        <div class="progress-header">
                            <span>Progression du financement</span>
                            <span class="progress-percentage">${loan.fundingProgress}%</span>
                        </div>
                        <div class="progress-bar">
                            <div class="progress-fill" style="width: ${loan.fundingProgress}%"></div>
                        </div>
                        <div class="progress-amounts">
                            <span>$${(loan.amount * loan.fundingProgress / 100).toLocaleString()}</span>
                            <span>/ $${loan.amount.toLocaleString()}</span>
                        </div>
                    </div>
                ` : ''}

                <div class="loan-actions">
                    ${this.userType === 'lender' && loan.status === 'pending' ? `
                        <button class="btn-primary" onclick="app.investInLoan('${loan.id}')">
                            <i class="fas fa-hand-holding-usd"></i> Investir
                        </button>
                    ` : ''}
                    <button class="btn-secondary" onclick="app.viewLoanDetails('${loan.id}')">
                        <i class="fas fa-eye"></i> Détails
                    </button>
                </div>
                
                <div class="loan-meta">
                    <span class="created-date">
                        <i class="fas fa-calendar"></i> ${this.formatDate(loan.createdAt)}
                    </span>
                </div>
            </div>
        `;
    }

    renderTokens() {
        const tokensGrid = document.getElementById('tokensGrid');
        if (!tokensGrid) return;

        // Update token statistics
        this.updateTokenStats();

        if (this.mockData.tokens.length === 0) {
            tokensGrid.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-coins"></i>
                    <h3>Aucun reçu numérique</h3>
                    <p>Vous n'avez pas encore créé de reçus numériques pour vos récoltes.</p>
                    <button class="btn-primary" onclick="app.openModal('tokenizeModal')">
                        <i class="fas fa-plus"></i> Créer un reçu
                    </button>
                </div>
            `;
            return;
        }

        tokensGrid.innerHTML = this.mockData.tokens.map(token => this.renderTokenCard(token)).join('');
    }

    renderTokenCard(token) {
        const statusClass = {
            'available': 'status-available',
            'pledged': 'status-pledged',
            'expired': 'status-expired'
        };

        const statusText = {
            'available': 'Disponible',
            'pledged': 'En garantie',
            'expired': 'Expiré'
        };

        const cropEmojis = {
            'maize': '🌽',
            'coffee': '☕',
            'wheat': '🌾',
            'rice': '🌾',
            'cocoa': '🍫'
        };

        return `
            <div class="token-card" data-token-id="${token.id}">
                <div class="token-header">
                    <div class="crop-info">
                        <span class="crop-emoji">${cropEmojis[token.type] || '🌱'}</span>
                        <div class="crop-details">
                            <h3>${token.type.charAt(0).toUpperCase() + token.type.slice(1)}</h3>
                            <span class="token-id">ID: ${token.id}</span>
                        </div>
                    </div>
                    <div class="token-status ${statusClass[token.status]}">
                        ${statusText[token.status]}
                    </div>
                </div>

                <div class="token-metrics">
                    <div class="metric-item">
                        <span class="metric-label">Quantité</span>
                        <span class="metric-value">${token.quantity}kg</span>
                    </div>
                    <div class="metric-item">
                        <span class="metric-label">Grade</span>
                        <span class="metric-value">Grade ${token.grade}</span>
                    </div>
                    <div class="metric-item">
                        <span class="metric-label">Valeur</span>
                        <span class="metric-value">$${token.value.toLocaleString()}</span>
                    </div>
                </div>

                <div class="token-location">
                    <i class="fas fa-map-marker-alt"></i>
                    <span>${token.location}</span>
                </div>

                <div class="token-dates">
                    <div class="date-item">
                        <span class="date-label">Récolte:</span>
                        <span class="date-value">${this.formatDate(token.harvestDate)}</span>
                    </div>
                    <div class="date-item">
                        <span class="date-label">Expire:</span>
                        <span class="date-value">${this.formatDate(token.expiryDate)}</span>
                    </div>
                </div>

                ${token.pledged ? `
                    <div class="pledge-info">
                        <i class="fas fa-lock"></i>
                        <span>Utilisé comme garantie pour le prêt ${token.loanId}</span>
                    </div>
                ` : ''}

                <div class="token-actions">
                    ${!token.pledged ? `
                        <button class="btn-primary" onclick="app.useAsCollateral('${token.id}')">
                            <i class="fas fa-shield-alt"></i> Utiliser comme garantie
                        </button>
                    ` : `
                        <button class="btn-secondary" disabled>
                            <i class="fas fa-lock"></i> En garantie
                        </button>
                    `}
                    <button class="btn-secondary" onclick="app.viewTokenDetails('${token.id}')">
                        <i class="fas fa-eye"></i> Détails
                    </button>
                </div>
            </div>
        `;
    }

    updateTokenStats() {
        const totalTokensEl = document.getElementById('totalTokens');
        const totalTokenValueEl = document.getElementById('totalTokenValue');
        const pledgedTokensEl = document.getElementById('pledgedTokens');

        const totalTokens = this.mockData.tokens.length;
        const totalValue = this.mockData.tokens.reduce((sum, token) => sum + token.value, 0);
        const pledgedTokens = this.mockData.tokens.filter(token => token.pledged).length;

        if (totalTokensEl) totalTokensEl.textContent = totalTokens;
        if (totalTokenValueEl) totalTokenValueEl.textContent = `$${totalValue.toLocaleString()}`;
        if (pledgedTokensEl) pledgedTokensEl.textContent = pledgedTokens;
    }

    // Filtering and Search
    getFilteredLoans() {
        let filteredLoans = [...this.mockData.loans];

        // Apply status filter
        const statusFilter = document.getElementById('loanStatusFilter')?.value;
        if (statusFilter) {
            filteredLoans = filteredLoans.filter(loan => loan.status === statusFilter);
        }

        // Apply crop type filter
        const cropTypeFilter = document.getElementById('cropTypeFilter')?.value;
        if (cropTypeFilter) {
            filteredLoans = filteredLoans.filter(loan => loan.collateral.type === cropTypeFilter);
        }

        // Apply amount filter
        const amountFilter = document.getElementById('amountFilter')?.value;
        if (amountFilter) {
            const [min, max] = amountFilter.split('-').map(val => val === '' ? Infinity : parseFloat(val));
            filteredLoans = filteredLoans.filter(loan => {
                return loan.amount >= (min || 0) && loan.amount <= (max || Infinity);
            });
        }

        return filteredLoans;
    }

    setupSearchFunctionality() {
        const searchInputs = document.querySelectorAll('.search-input');
        searchInputs.forEach(input => {
            input.addEventListener('input', this.handleSearch.bind(this));
        });
    }

    handleSearch(event) {
        const query = event.target.value.toLowerCase();
        const currentPage = document.querySelector('.page.active')?.id;

        if (currentPage === 'loans') {
            this.searchLoans(query);
        } else if (currentPage === 'tokens') {
            this.searchTokens(query);
        }
    }

    // Language and Theme Management
    setupLanguageToggle() {
        const languageButtons = document.querySelectorAll('[data-lang]');
        languageButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const lang = btn.dataset.lang;
                this.switchLanguage(lang);
            });
        });
    }

    switchLanguage(lang) {
        this.currentLanguage = lang;

        // Use the language manager to switch
        if (this.languageManager) {
            this.languageManager.switchLanguage(lang);
        }

        // Update button states
        document.querySelectorAll('[data-lang]').forEach(btn => {
            btn.classList.remove('active');
            if (btn.dataset.lang === lang) {
                btn.classList.add('active');
            }
        });

        // Update all translatable elements
        this.updateLanguageElements();

        // Update dynamically generated content
        this.updateDynamicContent();

        localStorage.setItem('language', lang);
    }

    updateLanguageElements() {
        if (!this.languageManager) return;

        // Update all elements with data-text attributes
        this.languageManager.updateAllElements();

        // Update dynamically generated content that doesn't use data-text
        this.updateDynamicTranslations();
    }

    updateDynamicTranslations() {
        const lang = this.currentLanguage;

        // Update user address display
        const userAddressElement = document.getElementById('userAddress');
        if (userAddressElement && !this.currentUser) {
            userAddressElement.textContent = lang === 'fr' ? 'Non connecté' : 'Not connected';
        }

        // Update loading overlay text
        const loadingOverlay = document.getElementById('loadingOverlay');
        if (loadingOverlay) {
            const loadingText = loadingOverlay.querySelector('p');
            if (loadingText) {
                loadingText.textContent = lang === 'fr' ? 'Traitement en cours...' : 'Processing transaction...';
            }
        }

        // Update wallet button text if connected
        const connectBtn = document.getElementById('connectWallet');
        if (connectBtn && connectBtn.classList.contains('connected')) {
            connectBtn.textContent = lang === 'fr' ? 'Portefeuille Connecté' : 'Wallet Connected';
        }

        // Update notification messages
        this.updateNotificationLanguage();

        // Re-render dynamic content with new language
        this.renderLoans();
        this.renderTokens();
        this.updateDashboard();
    }

    updateDynamicContent() {
        // Update form validation messages
        this.updateFormValidationMessages();

        // Update dropdown options
        this.updateDropdownOptions();

        // Update modal content
        this.updateModalContent();
    }

    updateFormValidationMessages() {
        const lang = this.currentLanguage;

        // Update validation messages based on language
        document.querySelectorAll('.validation-message').forEach(msg => {
            const text = msg.textContent;
            if (text.includes('obligatoire') || text.includes('required')) {
                msg.textContent = lang === 'fr' ? 'Ce champ est obligatoire' : 'This field is required';
            }
            // Add more validation message translations as needed
        });
    }

    updateDropdownOptions() {
        const lang = this.currentLanguage;

        // Update crop type options
        const cropSelects = document.querySelectorAll('#cropType');
        cropSelects.forEach(select => {
            const selectedValue = select.value;
            select.innerHTML = lang === 'fr' ? `
                <option value="">Sélectionnez votre récolte</option>
                <option value="maize">🌽 Maïs</option>
                <option value="rice">🌾 Riz</option>
                <option value="wheat">🌾 Blé</option>
                <option value="coffee">☕ Café</option>
                <option value="cocoa">🍫 Cacao</option>
                <option value="beans">🫘 Haricots</option>
            ` : `
                <option value="">Select your crop</option>
                <option value="maize">🌽 Maize</option>
                <option value="rice">🌾 Rice</option>
                <option value="wheat">🌾 Wheat</option>
                <option value="coffee">☕ Coffee</option>
                <option value="cocoa">🍫 Cocoa</option>
                <option value="beans">🫘 Beans</option>
            `;
            select.value = selectedValue;
        });

        // Update loan purpose options
        const purposeSelects = document.querySelectorAll('#loanPurpose');
        purposeSelects.forEach(select => {
            const selectedValue = select.value;
            select.innerHTML = lang === 'fr' ? `
                <option value="seeds">🌱 Semences et intrants</option>
                <option value="equipment">🚜 Équipement agricole</option>
                <option value="irrigation">💧 Système d'irrigation</option>
                <option value="storage">🏪 Installations de stockage</option>
                <option value="working-capital">💼 Fonds de roulement</option>
                <option value="other">🔧 Autre</option>
            ` : `
                <option value="seeds">🌱 Seeds & Inputs</option>
                <option value="equipment">🚜 Farm Equipment</option>
                <option value="irrigation">💧 Irrigation System</option>
                <option value="storage">🏪 Storage Facilities</option>
                <option value="working-capital">💼 Working Capital</option>
                <option value="other">🔧 Other</option>
            `;
            select.value = selectedValue;
        });
    }

    updateModalContent() {
        const lang = this.currentLanguage;

        // Update modal titles that aren't using data-text
        const modalTitles = {
            'tokenizeModal': lang === 'fr' ? 'Créer un Reçu Numérique' : 'Create Digital Receipt',
            'loanModal': lang === 'fr' ? 'Demander un Financement' : 'Request Financing',
            'supportModal': lang === 'fr' ? 'Contacter le Support' : 'Contact Support'
        };

        Object.keys(modalTitles).forEach(modalId => {
            const modal = document.getElementById(modalId);
            if (modal) {
                const titleElement = modal.querySelector('.modal-header h3');
                if (titleElement) {
                    const icon = titleElement.querySelector('i');
                    const iconHtml = icon ? icon.outerHTML + ' ' : '';
                    titleElement.innerHTML = iconHtml + modalTitles[modalId];
                }
            }
        });
    }

    updateNotificationLanguage() {
        // This will be used for future notifications
        // Current notifications will use the language manager's translation system
    }

    // Add missing translations property
    get translations() {
        return this.languageManager?.translations || {};
    }

    // Navigation Functions - Added missing functions
    toggleDropdown() {
        const dropdown = document.querySelector('.dropdown-menu');
        if (dropdown) {
            dropdown.classList.toggle('active');
        }
    }

    toggleMobileMenu() {
        const navMenu = document.querySelector('.nav-menu');
        const navToggle = document.querySelector('.nav-toggle');

        if (navMenu && navToggle) {
            navMenu.classList.toggle('active');
            const icon = navToggle.querySelector('i');
            if (icon) {
                icon.classList.toggle('fa-bars');
                icon.classList.toggle('fa-times');
            }
        }
    }

    showFarmerDashboard() {
        this.switchUserType('farmer');
        this.showPage('dashboard');
    }

    showLenderDashboard() {
        this.switchUserType('lender');
        this.showPage('dashboard');
    }

    // Close dropdown when clicking outside
    setupDropdownEvents() {
        document.addEventListener('click', (e) => {
            const dropdown = document.querySelector('.nav-dropdown');
            const dropdownMenu = document.querySelector('.dropdown-menu');

            if (dropdown && dropdownMenu && !dropdown.contains(e.target)) {
                dropdownMenu.classList.remove('active');
            }
        });
    }

    // Theme Management - Added missing function
    setupThemeToggle() {
        const themeToggle = document.querySelector('.theme-toggle, .nav-utility-btn[aria-label*="Toggle"], button[onclick*="toggleTheme"]');

        // Force le dégradé coloré de la hero section au chargement
        this.forceHeroGradient();

        if (themeToggle) {
            themeToggle.addEventListener('click', () => {
                this.toggleTheme();
            });
        }

        // Detect system theme preference
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');
        prefersDark.addEventListener('change', (e) => {
            if (!localStorage.getItem('theme-preference')) {
                this.setTheme(e.matches ? 'dark' : 'light');
            }
        });

        // Load saved theme or use system preference
        const savedTheme = localStorage.getItem('theme-preference');
        if (savedTheme) {
            this.setTheme(savedTheme);
        } else {
            this.setTheme(prefersDark.matches ? 'dark' : 'light');
        }

        // Force le dégradé après l'application du thème
        setTimeout(() => {
            this.forceHeroGradient();
        }, 100);
    }

    // Force le dégradé coloré de la hero section
    forceHeroGradient() {
        const heroBackground = document.querySelector('.hero-background');
        if (heroBackground && (document.body.classList.contains('light-theme') || !document.body.classList.contains('dark-theme'))) {
            heroBackground.style.background = `linear-gradient(135deg,
                rgba(30, 64, 175, 0.95) 0%,
                rgba(0, 212, 170, 0.85) 50%,
                rgba(16, 185, 129, 0.9) 100%)`;
            heroBackground.style.setProperty('background', `linear-gradient(135deg,
                rgba(30, 64, 175, 0.95) 0%,
                rgba(0, 212, 170, 0.85) 50%,
                rgba(16, 185, 129, 0.9) 100%)`, 'important');
        }
    }

    // Toggle between light and dark themes
    toggleTheme() {
        const currentTheme = document.body.classList.contains('dark-theme') ? 'dark' : 'light';
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        this.setTheme(newTheme);
        localStorage.setItem('theme-preference', newTheme);
    }

    // Set theme and force hero gradient for light theme
    setTheme(theme) {
        this.theme = theme;

        if (theme === 'dark') {
            document.body.classList.add('dark-theme');
            document.body.classList.remove('light-theme');
        } else {
            document.body.classList.remove('dark-theme');
            document.body.classList.add('light-theme');
            // Force le dégradé en mode light
            setTimeout(() => {
                this.forceHeroGradient();
            }, 50);
        }

        // Update theme toggle icon
        const themeIcon = document.querySelector('.theme-toggle i, .nav-utility-btn i');
        if (themeIcon) {
            themeIcon.classList.toggle('fa-moon', theme === 'light');
            themeIcon.classList.toggle('fa-sun', theme === 'dark');
        }
    }

    // ROI Calculator - Added missing function
    renderCalculator() {
        const calculatorPage = document.getElementById('calculator');
        if (!calculatorPage) return;

        const container = calculatorPage.querySelector('.container');
        if (!container) return;

        const lang = this.currentLanguage;

        container.innerHTML = `
            <div class="page-header">
                <h1><i class="fas fa-calculator"></i> ${lang === 'fr' ? 'Calculateur ROI' : 'ROI Calculator'}</h1>
            </div>

            <div class="calculator-section">
                <div class="calculator-grid">
                    <!-- Investment Calculator -->
                    <div class="calculator-card">
                        <div class="card-header">
                            <h3><i class="fas fa-chart-line"></i> ${lang === 'fr' ? 'Calculateur d\'Investissement' : 'Investment Calculator'}</h3>
                        </div>
                        <div class="card-content">
                            <div class="form-group">
                                <label>${lang === 'fr' ? 'Montant d\'investissement ($)' : 'Investment Amount ($)'}</label>
                                <input type="number" id="investmentAmount" placeholder="5000" min="100" value="5000">
                            </div>
                            
                            <div class="form-group">
                                <label>${lang === 'fr' ? 'Taux d\'intérêt annuel (%)' : 'Annual Interest Rate (%)'}</label>
                                <input type="number" id="interestRate" placeholder="8.5" min="1" max="20" step="0.1" value="8.5">
                            </div>
                            
                            <div class="form-group">
                                <label>${lang === 'fr' ? 'Période (mois)' : 'Period (months)'}</label>
                                <select id="investmentPeriod">
                                    <option value="3">3 ${lang === 'fr' ? 'mois' : 'months'}</option>
                                    <option value="6" selected>6 ${lang === 'fr' ? 'mois' : 'months'}</option>
                                    <option value="12">12 ${lang === 'fr' ? 'mois' : 'months'}</option>
                                    <option value="24">24 ${lang === 'fr' ? 'mois' : 'months'}</option>
                                </select>
                            </div>
                            
                            <button class="btn-primary" onclick="calculateROI()">
                                <i class="fas fa-calculator"></i> ${lang === 'fr' ? 'Calculer le ROI' : 'Calculate ROI'}
                            </button>
                        </div>
                    </div>

                    <!-- Results Display -->
                    <div class="calculator-card">
                        <div class="card-header">
                            <h3><i class="fas fa-chart-pie"></i> ${lang === 'fr' ? 'Résultats' : 'Results'}</h3>
                        </div>
                        <div class="card-content">
                            <div id="calculatorResults" class="results-display">
                                <div class="result-item">
                                    <span class="result-label">${lang === 'fr' ? 'Rendement total:' : 'Total Return:'}</span>
                                    <span class="result-value" id="totalReturn">$0</span>
                                </div>
                                <div class="result-item">
                                    <span class="result-label">${lang === 'fr' ? 'Profit:' : 'Profit:'}</span>
                                    <span class="result-value profit" id="totalProfit">$0</span>
                                </div>
                                <div class="result-item">
                                    <span class="result-label">${lang === 'fr' ? 'ROI:' : 'ROI:'}</span>
                                    <span class="result-value roi" id="roiPercentage">0%</span>
                                </div>
                                <div class="result-item">
                                    <span class="result-label">${lang === 'fr' ? 'Rendement mensuel:' : 'Monthly Return:'}</span>
                                    <span class="result-value" id="monthlyReturn">$0</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Risk Assessment -->
                <div class="risk-assessment">
                    <h3><i class="fas fa-shield-alt"></i> ${lang === 'fr' ? 'Évaluation des Risques' : 'Risk Assessment'}</h3>
                    <div class="risk-grid">
                        <div class="risk-item low-risk">
                            <div class="risk-icon">
                                <i class="fas fa-check-circle"></i>
                            </div>
                            <div class="risk-content">
                                <h4>${lang === 'fr' ? 'Risque Faible' : 'Low Risk'}</h4>
                                <p>${lang === 'fr' ? 'Prêts garantis par des actifs physiques' : 'Loans backed by physical assets'}</p>
                            </div>
                        </div>
                        
                        <div class="risk-item medium-risk">
                            <div class="risk-icon">
                                <i class="fas fa-exclamation-triangle"></i>
                            </div>
                            <div class="risk-content">
                                <h4>${lang === 'fr' ? 'Diversification' : 'Diversification'}</h4>
                                <p>${lang === 'fr' ? 'Répartissez vos investissements sur plusieurs prêts' : 'Spread investments across multiple loans'}</p>
                            </div>
                        </div>
                        
                        <div class="risk-item info-risk">
                            <div class="risk-icon">
                                <i class="fas fa-info-circle"></i>
                            </div>
                            <div class="risk-content">
                                <h4>${lang === 'fr' ? 'Transparence' : 'Transparency'}</h4>
                                <p>${lang === 'fr' ? 'Toutes les transactions sont vérifiables sur la blockchain' : 'All transactions are verifiable on blockchain'}</p>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Historical Performance -->
                <div class="performance-section">
                    <h3><i class="fas fa-chart-bar"></i> ${lang === 'fr' ? 'Performance Historique' : 'Historical Performance'}</h3>
                    <div class="performance-stats">
                        <div class="stat-item">
                            <span class="stat-number">8.7%</span>
                            <span class="stat-label">${lang === 'fr' ? 'Rendement moyen' : 'Average Return'}</span>
                        </div>
                        <div class="stat-item">
                            <span class="stat-number">2.8%</span>
                            <span class="stat-label">${lang === 'fr' ? 'Taux de défaut' : 'Default Rate'}</span>
                        </div>
                        <div class="stat-item">
                            <span class="stat-number">450+</span>
                            <span class="stat-label">${lang === 'fr' ? 'Prêts financés' : 'Loans Funded'}</span>
                        </div>
                        <div class="stat-item">
                            <span class="stat-number">$2.5M+</span>
                            <span class="stat-label">${lang === 'fr' ? 'Volume total' : 'Total Volume'}</span>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Calculate initial ROI with default values
        this.calculateROIValues();
    }

    calculateROIValues() {
        const amount = parseFloat(document.getElementById('investmentAmount')?.value) || 5000;
        const rate = parseFloat(document.getElementById('interestRate')?.value) || 8.5;
        const period = parseInt(document.getElementById('investmentPeriod')?.value) || 6;

        // Simple interest calculation for clarity
        const monthlyRate = rate / 100 / 12;
        const totalReturn = amount * (1 + (monthlyRate * period));
        const profit = totalReturn - amount;
        const roi = (profit / amount) * 100;
        const monthlyReturn = profit / period;

        // Update display
        const totalReturnEl = document.getElementById('totalReturn');
        const totalProfitEl = document.getElementById('totalProfit');
        const roiPercentageEl = document.getElementById('roiPercentage');
        const monthlyReturnEl = document.getElementById('monthlyReturn');

        if (totalReturnEl) totalReturnEl.textContent = `$${totalReturn.toFixed(2)}`;
        if (totalProfitEl) totalProfitEl.textContent = `$${profit.toFixed(2)}`;
        if (roiPercentageEl) roiPercentageEl.textContent = `${roi.toFixed(2)}%`;
        if (monthlyReturnEl) monthlyReturnEl.textContent = `$${monthlyReturn.toFixed(2)}`;
    }

    // Analytics rendering - Added missing function
    renderAnalytics() {
        // This function was referenced but not implemented
        console.log('Analytics page rendered');
        // Implementation can be added later for detailed analytics
    }

    // Missing utility functions
    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString(this.currentLanguage === 'fr' ? 'fr-FR' : 'en-US');
    }

    // Initialize missing functions
    loadInitialData() {
        // Load any initial data needed
        console.log('Loading initial data...');
    }

    populateDropdowns() {
        // Populate collateral dropdown in loan form
        const collateralSelect = document.getElementById('collateralToken');
        if (collateralSelect) {
            const availableTokens = this.mockData.tokens.filter(token => !token.pledged);
            collateralSelect.innerHTML = '<option value="">Sélectionnez votre garantie</option>' +
                availableTokens.map(token =>
                    `<option value="${token.id}">${token.quantity}kg ${token.type} (Grade ${token.grade}) - $${token.value.toLocaleString()}</option>`
                ).join('');
        }
    }

    initializeTooltips() {
        // Initialize tooltip system
        console.log('Tooltips initialized');
    }

    initializeHelpSystem() {
        // Initialize help system
        console.log('Help system initialized');
    }

    // ...existing code...
}

// Global Functions (for onclick handlers)
function showPage(pageId) {
    if (window.app) {
        window.app.showPage(pageId);
    }
}

function showFarmerDashboard() {
    if (window.app) {
        window.app.switchUserType('farmer');
        window.app.showPage('dashboard');
    }
}

function showLenderDashboard() {
    if (window.app) {
        window.app.switchUserType('lender');
        window.app.showPage('dashboard');
    }
}

function switchUserType(userType) {
    if (window.app) {
        window.app.switchUserType(userType);
    }
}

function openTokenizeModal() {
    if (window.app) {
        window.app.openModal('tokenizeModal');
    }
}

function openLoanModal() {
    if (window.app) {
        window.app.openModal('loanModal');
    }
}

function openSupportModal() {
    if (window.app) {
        window.app.openModal('supportModal');
    }
}

function closeModal(modalId) {
    if (window.app) {
        window.app.closeModal(modalId);
    }
}

function submitTokenizeForm() {
    const form = document.getElementById('tokenizeForm');
    if (form) {
        form.dispatchEvent(new Event('submit'));
    }
}

function submitLoanForm() {
    const form = document.getElementById('loanForm');
    if (form) {
        form.dispatchEvent(new Event('submit'));
    }
}

function submitSupportForm() {
    const form = document.getElementById('supportForm');
    if (form) {
        form.dispatchEvent(new Event('submit'));
    }
}

function filterLoans() {
    if (window.app) {
        window.app.renderLoans();
    }
}

function toggleFAQ(element) {
    const faqItem = element.closest('.faq-item');
    const answer = faqItem.querySelector('.faq-answer');
    const icon = element.querySelector('i');

    element.classList.toggle('active');
    answer.classList.toggle('active');

    if (answer.classList.contains('active')) {
        icon.style.transform = 'rotate(45deg)';
    } else {
        icon.style.transform = 'rotate(0deg)';
    }
}

function toggleDropdown() {
    const dropdown = document.querySelector('.dropdown-menu');
    if (dropdown) {
        dropdown.classList.toggle('active');
    }
}

function toggleTheme() {
    if (window.app) {
        window.app.toggleTheme();
    }
}

function toggleMobileMenu() {
    if (window.app) {
        window.app.toggleMobileMenu();
    }
}

function investInLoan(loanId) {
    if (window.app) {
        window.app.investInLoan(loanId);
    }
}

// Global function for language switching
function switchLanguage(lang) {
    if (window.app) {
        window.app.switchLanguage(lang);
    }
}

// Global function for ROI Calculator
function calculateROI() {
    if (window.app) {
        window.app.calculateROIValues();

        // Add event listeners for real-time calculation
        const amountInput = document.getElementById('investmentAmount');
        const rateInput = document.getElementById('interestRate');
        const periodSelect = document.getElementById('investmentPeriod');

        if (amountInput && rateInput && periodSelect) {
            [amountInput, rateInput, periodSelect].forEach(element => {
                element.addEventListener('input', () => {
                    window.app.calculateROIValues();
                });
            });
        }
    }
}

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    window.app = new HederaAgriFundApp();
    window.app.init();
});
