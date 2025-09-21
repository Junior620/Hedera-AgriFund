// Language Manager for Hedera AgriFund
class LanguageManager {
    constructor() {
        this.currentLanguage = localStorage.getItem('language') || 'fr';
        this.supportedLanguages = ['fr', 'en'];
        this.translations = {
            fr: {
                // Navigation
                'nav_home': 'Accueil',
                'nav_dashboard': 'Tableau de bord',
                'nav_loans': 'Prêts',
                'nav_tokens': 'Reçus Numériques',
                'nav_analytics': 'Analytics',
                'nav_profile': 'Profil',
                'nav_help': 'Aide & FAQ',
                'nav_calculator': 'Calculateur ROI',
                'connect_wallet': 'Connecter Portefeuille',
                'wallet_connected': 'Portefeuille Connecté',
                'more': 'Plus',
                'theme_toggle': 'Mode Sombre',

                // Hero Section
                'hero_title': 'Libérez la Valeur de Votre Ferme',
                'hero_description': 'Tokenisez vos récoltes comme garantie et accédez à un financement instantané grâce à la technologie blockchain',
                'total_value_locked': 'Valeur Totale Bloquée',
                'farmers_funded': 'Agriculteurs Financés',
                'default_rate': 'Taux de Défaut',
                'im_farmer': 'Je suis Agriculteur',
                'im_lender': 'Je suis Prêteur',

                // How It Works
                'how_it_works': 'Comment fonctionne Hedera AgriFund',
                'step1_title': '1. Tokeniser les Actifs',
                'step1_desc': 'Convertissez vos récoltes en jetons numériques adossés à des actifs réels stockés dans des entrepôts vérifiés.',
                'step2_title': '2. Créer une Demande de Prêt',
                'step2_desc': 'Utilisez vos récoltes tokenisées comme garantie pour demander des prêts à des taux compétitifs.',
                'step3_title': '3. Obtenir un Financement',
                'step3_desc': 'Des prêteurs mondiaux financent votre prêt automatiquement via des contrats intelligents sur le réseau Hedera.',
                'step4_title': '4. Développer et Rembourser',
                'step4_desc': 'Utilisez les fonds pour développer votre ferme et remboursez le prêt lors de la vente de votre récolte.',

                // Benefits
                'benefit1_title': 'Taux d\'Intérêt Bas',
                'benefit1_desc': 'Taux compétitifs à partir de 6,5% APY',
                'benefit2_title': 'Approbation Rapide',
                'benefit2_desc': 'Obtenez un financement en minutes, pas en semaines',
                'benefit3_title': 'Sécurisé et Transparent',
                'benefit3_desc': 'Sécurité basée sur blockchain et transparence totale',
                'benefit4_title': 'Accès Global',
                'benefit4_desc': 'Connectez-vous avec des prêteurs du monde entier',

                // Dashboard
                'dashboard_title': 'Tableau de bord',
                'farmer_mode': 'Agriculteur',
                'lender_mode': 'Prêteur',
                'account_overview': 'Aperçu du Compte',
                'portfolio_distribution': 'Répartition du Portefeuille',
                'portfolio_overview': 'Aperçu du Portefeuille',
                'risk_distribution': 'Répartition des Risques',
                'top_opportunities': 'Meilleures Opportunités d\'Investissement',
                'view_all': 'Voir Tout',
                'total_collateral': 'Valeur Totale Garantie',
                'active_loans': 'Prêts Actifs',
                'credit_score': 'Score de Crédit',
                'total_invested': 'Total Investi',
                'active_investments': 'Investissements Actifs',
                'monthly_return': 'Rendement Mensuel',
                'recent_activity': 'Activité Récente',
                'quick_actions': 'Actions Rapides',
                'tokenize_assets': 'Tokeniser Récoltes',
                'request_loan': 'Demander Prêt',
                'view_tokens': 'Voir Reçus',
                'my_loans': 'Mes Prêts',

                // Forms
                'create_receipt': 'Créer un Reçu Numérique',
                'crop_type': 'Type de récolte',
                'select_crop': 'Sélectionnez votre récolte',
                'quantity_kg': 'Quantité possédée (kg)',
                'quality_grade': 'Grade de qualité',
                'storage_location': 'Lieu de stockage',
                'harvest_date': 'Date de récolte',
                'estimated_value': 'Valeur estimée',
                'financing_available': 'Financement disponible',
                'create_receipt_btn': 'Créer le Reçu',
                'cancel': 'Annuler',

                // Loan Form
                'request_financing': 'Demander un Financement',
                'desired_amount': 'Montant souhaité (USDC)',
                'collateral_receipt': 'Garantie (Reçu numérique)',
                'select_collateral': 'Sélectionnez votre garantie',
                'fund_usage': 'Utilisation des fonds',
                'repayment_period': 'Durée de remboursement',
                'loan_summary': 'Résumé de votre demande',
                'interest_rate': 'Taux d\'intérêt',
                'ltv_ratio': 'Ratio LTV',
                'monthly_payment': 'Mensualité',
                'total_repayment': 'Total à rembourser',
                'submit_request': 'Soumettre la Demande',

                // Status
                'status_pending': 'En attente',
                'status_funded': 'Financé',
                'status_repaid': 'Remboursé',
                'status_defaulted': 'Défaillant',
                'status_available': 'Disponible',
                'status_pledged': 'En garantie',
                'status_expired': 'Expiré',

                // Messages
                'app_initialized': 'Application initialisée avec succès!',
                'wallet_connected_success': 'Portefeuille connecté avec succès!',
                'receipt_created': 'Reçu numérique créé avec succès!',
                'loan_submitted': 'Demande de prêt soumise avec succès!',
                'investment_success': 'Investissement réalisé avec succès!',
                'form_errors': 'Veuillez corriger les erreurs dans le formulaire',
                'field_required': 'Ce champ est obligatoire',
                'invalid_email': 'Veuillez entrer un email valide',
                'invalid_number': 'Veuillez entrer un nombre valide',
                'min_value': 'La valeur doit être d\'au moins',
                'max_value': 'La valeur ne peut pas dépasser',
                'min_quantity': 'La quantité minimum est de 100kg',
                'amount_range': 'Le montant doit être entre $100 et $50,000',
                'language_changed': 'Langue changée en français',

                // Empty States
                'no_loans_found': 'Aucun prêt trouvé',
                'no_loans_desc': 'Aucun prêt ne correspond à vos critères de recherche.',
                'no_receipts': 'Aucun reçu numérique',
                'no_receipts_desc': 'Vous n\'avez pas encore créé de reçus numériques pour vos récoltes.',
                'create_request': 'Créer une demande',
                'create_receipt': 'Créer un reçu',

                // Time
                'today': 'Aujourd\'hui',
                'yesterday': 'Hier',
                'days_ago': 'Il y a {0} jours',

                // Crop Types
                'maize': 'Maïs',
                'coffee': 'Café',
                'wheat': 'Blé',
                'rice': 'Riz',
                'cocoa': 'Cacao',
                'beans': 'Haricots'
            },
            en: {
                // Navigation
                'nav_home': 'Home',
                'nav_dashboard': 'Dashboard',
                'nav_loans': 'Loans',
                'nav_tokens': 'Digital Receipts',
                'nav_analytics': 'Analytics',
                'nav_profile': 'Profile',
                'nav_help': 'Help & FAQ',
                'nav_calculator': 'ROI Calculator',
                'connect_wallet': 'Connect Wallet',
                'wallet_connected': 'Wallet Connected',
                'more': 'More',
                'theme_toggle': 'Dark Mode',

                // Hero Section
                'hero_title': 'Unlock Your Farm\'s Value',
                'hero_description': 'Tokenize your crops as collateral and access instant financing through blockchain technology',
                'total_value_locked': 'Total Value Locked',
                'farmers_funded': 'Farmers Funded',
                'default_rate': 'Default Rate',
                'im_farmer': 'I\'m a Farmer',
                'im_lender': 'I\'m a Lender',

                // How It Works
                'how_it_works': 'How Hedera AgriFund Works',
                'step1_title': '1. Tokenize Assets',
                'step1_desc': 'Convert your crops into digital tokens backed by real assets stored in verified warehouses.',
                'step2_title': '2. Create Loan Request',
                'step2_desc': 'Use your tokenized crops as collateral to request loans at competitive rates.',
                'step3_title': '3. Get Funding',
                'step3_desc': 'Global lenders fund your loan automatically via smart contracts on the Hedera network.',
                'step4_title': '4. Grow and Repay',
                'step4_desc': 'Use funds to grow your farm and repay the loan when you sell your harvest.',

                // Benefits
                'benefit1_title': 'Low Interest Rates',
                'benefit1_desc': 'Competitive rates starting from 6.5% APY',
                'benefit2_title': 'Fast Approval',
                'benefit2_desc': 'Get funding in minutes, not weeks',
                'benefit3_title': 'Secure and Transparent',
                'benefit3_desc': 'Blockchain-based security and full transparency',
                'benefit4_title': 'Global Access',
                'benefit4_desc': 'Connect with lenders worldwide',

                // Dashboard
                'dashboard_title': 'Dashboard',
                'farmer_mode': 'Farmer',
                'lender_mode': 'Lender',
                'account_overview': 'Account Overview',
                'portfolio_distribution': 'Portfolio Distribution',
                'portfolio_overview': 'Portfolio Overview',
                'risk_distribution': 'Risk Distribution',
                'top_opportunities': 'Top Investment Opportunities',
                'view_all': 'View All',
                'total_collateral': 'Total Collateral Value',
                'active_loans': 'Active Loans',
                'credit_score': 'Credit Score',
                'total_invested': 'Total Invested',
                'active_investments': 'Active Investments',
                'monthly_return': 'Monthly Return',
                'recent_activity': 'Recent Activity',
                'quick_actions': 'Quick Actions',
                'tokenize_assets': 'Tokenize Assets',
                'request_loan': 'Request Loan',
                'view_tokens': 'View Tokens',
                'my_loans': 'My Loans',

                // Forms
                'create_receipt': 'Create Digital Receipt',
                'crop_type': 'Crop type',
                'select_crop': 'Select your crop',
                'quantity_kg': 'Quantity owned (kg)',
                'quality_grade': 'Quality grade',
                'storage_location': 'Storage location',
                'harvest_date': 'Harvest date',
                'estimated_value': 'Estimated value',
                'financing_available': 'Financing available',
                'create_receipt_btn': 'Create Receipt',
                'cancel': 'Cancel',

                // Loan Form
                'request_financing': 'Request Financing',
                'desired_amount': 'Desired amount (USDC)',
                'collateral_receipt': 'Collateral (Digital receipt)',
                'select_collateral': 'Select your collateral',
                'fund_usage': 'Fund usage',
                'repayment_period': 'Repayment period',
                'loan_summary': 'Loan summary',
                'interest_rate': 'Interest rate',
                'ltv_ratio': 'LTV ratio',
                'monthly_payment': 'Monthly payment',
                'total_repayment': 'Total repayment',
                'submit_request': 'Submit Request',

                // Status
                'status_pending': 'Pending',
                'status_funded': 'Funded',
                'status_repaid': 'Repaid',
                'status_defaulted': 'Defaulted',
                'status_available': 'Available',
                'status_pledged': 'Pledged',
                'status_expired': 'Expired',

                // Messages
                'app_initialized': 'Application initialized successfully!',
                'wallet_connected_success': 'Wallet connected successfully!',
                'receipt_created': 'Digital receipt created successfully!',
                'loan_submitted': 'Loan request submitted successfully!',
                'investment_success': 'Investment completed successfully!',
                'form_errors': 'Please correct errors in the form',
                'field_required': 'This field is required',
                'invalid_email': 'Please enter a valid email',
                'invalid_number': 'Please enter a valid number',
                'min_value': 'Value must be at least',
                'max_value': 'Value cannot exceed',
                'min_quantity': 'Minimum quantity is 100kg',
                'amount_range': 'Amount must be between $100 and $50,000',
                'language_changed': 'Language changed to English',

                // Empty States
                'no_loans_found': 'No loans found',
                'no_loans_desc': 'No loans match your search criteria.',
                'no_receipts': 'No digital receipts',
                'no_receipts_desc': 'You haven\'t created any digital receipts for your crops yet.',
                'create_request': 'Create request',
                'create_receipt': 'Create receipt',

                // Time
                'today': 'Today',
                'yesterday': 'Yesterday',
                'days_ago': '{0} days ago',

                // Crop Types
                'maize': 'Maize',
                'coffee': 'Coffee',
                'wheat': 'Wheat',
                'rice': 'Rice',
                'cocoa': 'Cocoa',
                'beans': 'Beans'
            }
        };

        this.init();
    }

    // Initialize language manager
    init() {
        // Validate current language
        if (!this.supportedLanguages.includes(this.currentLanguage)) {
            this.currentLanguage = 'fr';
            localStorage.setItem('language', this.currentLanguage);
        }

        // Apply language on page load
        document.addEventListener('DOMContentLoaded', () => {
            this.updateAllElements();
            this.updateLanguageButtons();
        });

        // Update immediately if DOM is already loaded
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                this.updateAllElements();
                this.updateLanguageButtons();
            });
        } else {
            this.updateAllElements();
            this.updateLanguageButtons();
        }
    }

    // Get translation for a key
    t(key, params = []) {
        let translation = this.translations[this.currentLanguage]?.[key] || key;

        // Replace parameters {0}, {1}, etc.
        if (params.length > 0) {
            params.forEach((param, index) => {
                translation = translation.replace(`{${index}}`, param);
            });
        }

        return translation;
    }

    // Switch language with improved feedback
    switchLanguage(language) {
        if (!this.supportedLanguages.includes(language)) {
            console.warn(`Language ${language} is not supported`);
            return false;
        }

        if (this.currentLanguage === language) {
            return true; // Already in this language
        }

        // Add transition effect
        document.body.style.transition = 'opacity 0.2s ease-in-out';
        document.body.style.opacity = '0.8';

        setTimeout(() => {
            this.currentLanguage = language;
            localStorage.setItem('language', language);
            this.updateAllElements();
            this.updateLanguageButtons();

            // Show notification
            this.showLanguageChangeNotification();

            // Restore opacity
            document.body.style.opacity = '1';

            // Remove transition after animation
            setTimeout(() => {
                document.body.style.transition = '';
            }, 200);
        }, 100);

        return true;
    }

    // Update all elements with data-text attribute
    updateAllElements() {
        // Update text content
        const elements = document.querySelectorAll('[data-text]');
        elements.forEach(element => {
            const key = element.getAttribute('data-text');
            const translation = this.t(key);
            if (element.textContent !== translation) {
                element.textContent = translation;
            }
        });

        // Update placeholders
        const placeholderElements = document.querySelectorAll('[data-placeholder]');
        placeholderElements.forEach(element => {
            const key = element.getAttribute('data-placeholder');
            element.placeholder = this.t(key);
        });

        // Update aria-labels
        const ariaElements = document.querySelectorAll('[data-aria-label]');
        ariaElements.forEach(element => {
            const key = element.getAttribute('data-aria-label');
            element.setAttribute('aria-label', this.t(key));
        });

        // Update title attributes
        const titleElements = document.querySelectorAll('[data-title]');
        titleElements.forEach(element => {
            const key = element.getAttribute('data-title');
            element.setAttribute('title', this.t(key));
        });

        // Update document title
        if (this.currentLanguage === 'en') {
            document.title = 'Hedera AgriFund - Decentralized Micro-finance for Farmers';
        } else {
            document.title = 'Hedera AgriFund - Micro-finance Décentralisée pour Agriculteurs';
        }

        // Update HTML lang attribute
        document.documentElement.lang = this.currentLanguage;
    }

    // Update language button states
    updateLanguageButtons() {
        const languageButtons = document.querySelectorAll('.language-btn');
        languageButtons.forEach(button => {
            const lang = button.getAttribute('data-lang');
            if (lang === this.currentLanguage) {
                button.classList.add('active');
            } else {
                button.classList.remove('active');
            }
        });
    }

    // Show language change notification
    showLanguageChangeNotification() {
        const message = this.t('language_changed');

        // Create notification element
        const notification = document.createElement('div');
        notification.className = 'language-notification';
        notification.innerHTML = `
            <i class="fas fa-language"></i>
            <span>${message}</span>
        `;

        // Add to page
        document.body.appendChild(notification);

        // Animate in
        setTimeout(() => notification.classList.add('show'), 10);

        // Remove after 3 seconds
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }

    // Get current language
    getCurrentLanguage() {
        return this.currentLanguage;
    }

    // Get supported languages
    getSupportedLanguages() {
        return [...this.supportedLanguages];
    }

    // Check if language is supported
    isLanguageSupported(language) {
        return this.supportedLanguages.includes(language);
    }

    // Get language name
    getLanguageName(language) {
        const names = {
            fr: 'Français',
            en: 'English'
        };
        return names[language] || language;
    }

    // Get language flag emoji
    getLanguageFlag(language) {
        const flags = {
            fr: '🇫🇷',
            en: '🇺🇸'
        };
        return flags[language] || '🌐';
    }
}

// Create global instance
const languageManager = new LanguageManager();

// Global function for backward compatibility
function switchLanguage(language) {
    return languageManager.switchLanguage(language);
}

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = LanguageManager;
}
