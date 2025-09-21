// UX Integration Module for Hedera AgriFund
class UXIntegration {
    constructor(app) {
        this.app = app;
        this.isInitialized = false;
    }

    // Initialize all UX enhancement systems
    async initialize() {
        if (this.isInitialized) return;

        try {
            console.log('Initializing UX Enhancement Systems...');

            // Initialize Enhanced UX Components
            await this.initializeUXEnhancements();

            // Initialize Onboarding Wizard
            await this.initializeOnboarding();

            // Initialize Glossary & Tooltip System
            await this.initializeGlossary();

            // Initialize Enhanced Dashboard
            await this.initializeDashboard();

            // Initialize Transaction Manager
            await this.initializeTransactionManager();

            // Setup additional systems
            this.setupLanguageSystem();
            this.setupPWA();
            this.setupAnalytics();

            this.isInitialized = true;
            console.log('✅ UX Enhancement systems initialized successfully');

        } catch (error) {
            console.error('❌ UX systems initialization failed:', error);
        }
    }

    // Initialize Enhanced UX Components
    async initializeUXEnhancements() {
        if (typeof UXEnhancements !== 'undefined') {
            this.app.ux = new UXEnhancements(this.app);

            // Initialize tooltips and enhanced forms
            this.app.ux.initTooltips();
            this.app.ux.setupFormValidation();
            this.app.ux.setupProgressiveDisclosure();
            this.app.ux.enhanceAccessibility();

            console.log('✓ UX Enhancements initialized');
        }
    }

    // Initialize Onboarding Wizard
    async initializeOnboarding() {
        if (typeof OnboardingWizard !== 'undefined') {
            this.app.onboarding = new OnboardingWizard(this.app.ux);

            // Check if user needs onboarding
            const isFirstTime = !localStorage.getItem('userOnboarded');
            const wasSkipped = localStorage.getItem('onboardingSkipped');

            if (isFirstTime && !wasSkipped) {
                // Delay onboarding slightly to let the page load
                setTimeout(() => {
                    this.app.onboarding.init();
                }, 1000);
            }

            console.log('✓ Onboarding Wizard initialized');
        }
    }

    // Initialize Glossary & Tooltip System
    async initializeGlossary() {
        if (typeof GlossaryTooltipSystem !== 'undefined') {
            this.app.glossary = new GlossaryTooltipSystem();
            this.app.glossary.init();

            // Make globally available for onclick handlers
            window.glossary = this.app.glossary;

            // Add glossary button to help menu
            this.addGlossaryButton();

            console.log('✓ Glossary & Tooltip System initialized');
        }
    }

    // Initialize Enhanced Dashboard
    async initializeDashboard() {
        if (typeof EnhancedDashboard !== 'undefined') {
            this.app.dashboard = new EnhancedDashboard(this.app);

            // Make globally available for onclick handlers
            window.dashboard = this.app.dashboard;

            // Auto-render dashboard when page is shown
            const originalShowPage = window.showPage;
            window.showPage = (pageId) => {
                originalShowPage(pageId);
                if (pageId === 'dashboard') {
                    setTimeout(() => {
                        this.app.dashboard.render();
                    }, 100);
                }
            };

            console.log('✓ Enhanced Dashboard initialized');
        }
    }

    // Initialize Transaction Manager
    async initializeTransactionManager() {
        if (typeof TransactionManager !== 'undefined') {
            this.app.txManager = new TransactionManager(this.app);

            // Make globally available for onclick handlers
            window.txManager = this.app.txManager;

            // Override existing transaction functions with enhanced versions
            this.enhanceTransactionFunctions();

            console.log('✓ Transaction Manager initialized');
        }
    }

    // Setup Language System
    setupLanguageSystem() {
        const currentLang = localStorage.getItem('language') || 'fr';

        // Create language switcher if it doesn't exist
        if (!document.querySelector('.language-switcher')) {
            this.createLanguageSwitcher(currentLang);
        }

        // Apply current language
        this.applyLanguage(currentLang);

        console.log('✓ Language System initialized');
    }

    // Create Language Switcher
    createLanguageSwitcher(currentLang) {
        const langSwitcher = document.createElement('div');
        langSwitcher.className = 'language-switcher';
        langSwitcher.innerHTML = `
            <button class="lang-btn ${currentLang === 'fr' ? 'active' : ''}" 
                    onclick="uxIntegration.switchLanguage('fr')" 
                    aria-label="Français">FR</button>
            <button class="lang-btn ${currentLang === 'en' ? 'active' : ''}" 
                    onclick="uxIntegration.switchLanguage('en')" 
                    aria-label="English">EN</button>
        `;

        // Add to navigation
        const navbar = document.querySelector('.navbar .nav-container');
        if (navbar) {
            navbar.appendChild(langSwitcher);
        }
    }

    // Switch Language
    switchLanguage(lang) {
        localStorage.setItem('language', lang);

        // Update language switcher
        document.querySelectorAll('.lang-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[onclick="uxIntegration.switchLanguage('${lang}')"]`)?.classList.add('active');

        // Apply language to all systems
        this.applyLanguage(lang);

        console.log(`Language switched to: ${lang}`);
    }

    // Apply Language to All Systems
    applyLanguage(lang) {
        // Update glossary language
        if (this.app.glossary) {
            this.app.glossary.setLanguage(lang);
        }

        // Update dashboard language
        if (this.app.dashboard) {
            this.app.dashboard.currentLang = lang;
            if (document.getElementById('dashboard').classList.contains('active')) {
                this.app.dashboard.render();
            }
        }

        // Update transaction manager language
        if (this.app.txManager) {
            this.app.txManager.currentLang = lang;
        }

        // Update UI text
        this.updateUILanguage(lang);
    }

    // Update UI Language
    updateUILanguage(lang) {
        const translations = {
            fr: {
                'connect_wallet': 'Connecter Portefeuille',
                'home': 'Accueil',
                'dashboard': 'Tableau de bord',
                'loans': 'Prêts',
                'tokens': 'Reçus Numériques',
                'analytics': 'Analyses',
                'profile': 'Profil',
                'help': 'Aide & FAQ',
                'i_am_farmer': 'Je suis Agriculteur',
                'i_am_lender': 'Je suis Investisseur'
            },
            en: {
                'connect_wallet': 'Connect Wallet',
                'home': 'Home',
                'dashboard': 'Dashboard',
                'loans': 'Loans',
                'tokens': 'Digital Receipts',
                'analytics': 'Analytics',
                'profile': 'Profile',
                'help': 'Help & FAQ',
                'i_am_farmer': 'I\'m a Farmer',
                'i_am_lender': 'I\'m a Lender'
            }
        };

        // Update navigation links
        const navLinks = document.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            const onclick = link.getAttribute('onclick');
            if (onclick && onclick.includes('showPage(')) {
                const pageId = onclick.match(/'([^']+)'/)?.[1];
                if (pageId && translations[lang][pageId]) {
                    link.textContent = translations[lang][pageId];
                }
            }
        });

        // Update buttons
        const connectBtn = document.getElementById('connectWallet');
        if (connectBtn && translations[lang]['connect_wallet']) {
            connectBtn.textContent = translations[lang]['connect_wallet'];
        }

        // Update hero buttons
        const farmerBtn = document.querySelector('[onclick="showFarmerDashboard()"]');
        const lenderBtn = document.querySelector('[onclick="showLenderDashboard()"]');

        if (farmerBtn) farmerBtn.innerHTML = `<i class="fas fa-tractor"></i> ${translations[lang]['i_am_farmer']}`;
        if (lenderBtn) lenderBtn.innerHTML = `<i class="fas fa-hand-holding-usd"></i> ${translations[lang]['i_am_lender']}`;
    }

    // Setup PWA (Progressive Web App)
    setupPWA() {
        // Register service worker for offline capabilities
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('/sw.js')
                .then(registration => {
                    console.log('✓ Service Worker registered:', registration);
                })
                .catch(registrationError => {
                    console.log('Service Worker registration failed:', registrationError);
                });
        }

        // Handle online/offline events
        window.addEventListener('online', () => this.handleOnlineStatus(true));
        window.addEventListener('offline', () => this.handleOnlineStatus(false));

        // Setup install prompt
        this.setupInstallPrompt();

        console.log('✓ PWA capabilities initialized');
    }

    // Handle Online/Offline Status
    handleOnlineStatus(isOnline) {
        let statusIndicator = document.querySelector('.network-status');

        if (!statusIndicator) {
            statusIndicator = this.createNetworkStatusIndicator();
        }

        statusIndicator.style.display = 'flex';

        if (isOnline) {
            statusIndicator.className = 'network-status online';
            statusIndicator.innerHTML = '<i class="fas fa-wifi" aria-hidden="true"></i> En ligne';

            // Process queued transactions
            if (this.app.txManager) {
                this.app.txManager.processQueuedTransactions();
            }

            // Auto-hide after 3 seconds
            setTimeout(() => {
                statusIndicator.style.display = 'none';
            }, 3000);

        } else {
            statusIndicator.className = 'network-status offline';
            statusIndicator.innerHTML = '<i class="fas fa-wifi-slash" aria-hidden="true"></i> Hors ligne';
        }
    }

    // Create Network Status Indicator
    createNetworkStatusIndicator() {
        const statusIndicator = document.createElement('div');
        statusIndicator.className = 'network-status';
        statusIndicator.style.cssText = `
            position: fixed;
            top: 1rem;
            right: 1rem;
            background: var(--card-background, #ffffff);
            border: 1px solid var(--border-color, #e0e0e0);
            border-radius: 6px;
            padding: 0.5rem 1rem;
            z-index: 1000;
            font-size: 0.9rem;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            display: none;
            align-items: center;
            gap: 0.5rem;
            transition: all 0.3s ease;
        `;

        document.body.appendChild(statusIndicator);
        return statusIndicator;
    }

    // Setup Install Prompt
    setupInstallPrompt() {
        let deferredPrompt;

        window.addEventListener('beforeinstallprompt', (e) => {
            e.preventDefault();
            deferredPrompt = e;
            this.showInstallButton(deferredPrompt);
        });
    }

    // Show Install Button
    showInstallButton(deferredPrompt) {
        // Don't show if already shown
        if (document.querySelector('.install-btn')) return;

        const installBtn = document.createElement('button');
        installBtn.className = 'install-btn btn-secondary';
        installBtn.innerHTML = '<i class="fas fa-download" aria-hidden="true"></i> Installer';
        installBtn.onclick = async () => {
            deferredPrompt.prompt();
            const { outcome } = await deferredPrompt.userChoice;
            console.log(`Install prompt outcome: ${outcome}`);
            deferredPrompt = null;
            installBtn.remove();
        };

        // Add to navigation
        const navbar = document.querySelector('.nav-menu');
        if (navbar) {
            navbar.appendChild(installBtn);
        }
    }

    // Add Glossary Button to Help Menu
    addGlossaryButton() {
        const dropdownMenu = document.querySelector('.dropdown-menu');
        if (dropdownMenu && !dropdownMenu.querySelector('[onclick*="glossary"]')) {
            const glossaryLink = document.createElement('a');
            glossaryLink.href = 'javascript:void(0)';
            glossaryLink.onclick = () => this.app.glossary.showFullGlossary();
            glossaryLink.innerHTML = '<i class="fas fa-book" aria-hidden="true"></i> Glossaire';

            dropdownMenu.insertBefore(glossaryLink, dropdownMenu.firstChild);
        }
    }

    // Enhance Transaction Functions
    enhanceTransactionFunctions() {
        // Enhance tokenization with transaction manager
        const originalTokenizeForm = document.getElementById('tokenizeForm');
        if (originalTokenizeForm) {
            originalTokenizeForm.addEventListener('submit', async (e) => {
                e.preventDefault();

                const formData = new FormData(originalTokenizeForm);
                const transactionData = {
                    title: 'Création de reçu numérique',
                    description: `Tokenisation de ${formData.get('cropQuantity')}kg de ${formData.get('cropType')}`,
                    amount: `${formData.get('cropQuantity')}kg`,
                    estimatedFee: '$0.05',
                    estimatedTime: '3-5 secondes',
                    successMessage: 'Votre reçu numérique a été créé avec succès!'
                };

                try {
                    await this.app.txManager.processTransaction(
                        async () => {
                            // Simulate transaction (replace with real implementation)
                            await new Promise(resolve => setTimeout(resolve, 2000));
                            return { txHash: '0x' + Math.random().toString(36).substr(2, 64) };
                        },
                        transactionData
                    );

                    // Close modal and refresh data
                    document.getElementById('tokenizeModal').classList.remove('active');
                    this.app.loadInitialData();

                } catch (error) {
                    console.error('Tokenization failed:', error);
                }
            });
        }
    }

    // Setup Analytics
    setupAnalytics() {
        // Initialize Google Analytics if available
        if (typeof gtag !== 'undefined') {
            gtag('config', 'GA_MEASUREMENT_ID', {
                page_title: 'Hedera AgriFund',
                page_location: window.location.href
            });
        }

        // Track page views
        const originalShowPage = window.showPage;
        if (originalShowPage) {
            window.showPage = (pageId) => {
                originalShowPage(pageId);
                this.trackPageView(pageId);
            };
        }

        console.log('✓ Analytics initialized');
    }

    // Track Page View
    trackPageView(pageId) {
        if (typeof gtag !== 'undefined') {
            gtag('event', 'page_view', {
                page_title: pageId,
                page_location: window.location.href + '#' + pageId
            });
        }

        // Store for offline analytics
        const events = JSON.parse(localStorage.getItem('analyticsQueue') || '[]');
        events.push({
            event: 'page_view',
            properties: { page: pageId, timestamp: Date.now() }
        });
        localStorage.setItem('analyticsQueue', JSON.stringify(events));
    }

    // Enhanced Error Handling
    handleError(error, context = 'Application') {
        console.error(`${context} Error:`, error);

        let userMessage = 'Une erreur inattendue s\'est produite.';
        let actionable = false;

        // Map technical errors to user-friendly messages
        if (error.message.includes('wallet')) {
            userMessage = 'Problème de connexion avec votre portefeuille. Veuillez vérifier qu\'il est déverrouillé.';
            actionable = true;
        } else if (error.message.includes('network')) {
            userMessage = 'Problème de connexion réseau. Vérifiez votre connexion internet.';
            actionable = true;
        } else if (error.message.includes('insufficient')) {
            userMessage = 'Fonds insuffisants pour effectuer cette transaction.';
            actionable = true;
        }

        this.showErrorNotification(userMessage, actionable);
    }

    // Show Error Notification
    showErrorNotification(message, actionable = false) {
        const notification = document.createElement('div');
        notification.className = 'error-notification';
        notification.innerHTML = `
            <div class="notification-content">
                <i class="fas fa-exclamation-triangle" aria-hidden="true"></i>
                <div class="notification-text">
                    <strong>Erreur</strong>
                    <p>${message}</p>
                </div>
                ${actionable ? '<button class="btn-link" onclick="this.parentElement.parentElement.remove()">Fermer</button>' : ''}
            </div>
        `;

        document.body.appendChild(notification);

        setTimeout(() => notification.classList.add('show'), 100);
        setTimeout(() => {
            if (notification.parentNode) {
                notification.classList.remove('show');
                setTimeout(() => notification.remove(), 300);
            }
        }, 5000);
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    // Wait for the main app to be ready
    const initUX = () => {
        if (typeof HederaAgriFundApp !== 'undefined' && window.app) {
            window.uxIntegration = new UXIntegration(window.app);
            window.uxIntegration.initialize();
        } else {
            // Retry after 100ms
            setTimeout(initUX, 100);
        }
    };

    initUX();
});

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = UXIntegration;
}
