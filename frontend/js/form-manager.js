// Enhanced Form Management for Hedera AgriFund
class FormManager {
    constructor(app) {
        this.app = app;
        this.currentLang = localStorage.getItem('language') || 'fr';
        this.cropPrices = {
            maize: 3.20,
            rice: 4.50,
            wheat: 2.80,
            coffee: 12.50,
            cocoa: 8.90,
            beans: 5.20
        };
    }

    init() {
        this.setupFormValidation();
        this.setupRealTimeCalculations();
        this.setupFormEnhancements();
        console.log('✓ Form Manager initialized');
    }

    // Setup enhanced form validation
    setupFormValidation() {
        // Tokenize form validation
        const tokenizeForm = document.getElementById('tokenizeForm');
        if (tokenizeForm) {
            this.setupTokenizeFormValidation();
        }

        // Loan form validation
        const loanForm = document.getElementById('loanForm');
        if (loanForm) {
            this.setupLoanFormValidation();
        }

        // Support form validation
        const supportForm = document.getElementById('supportForm');
        if (supportForm) {
            this.setupSupportFormValidation();
        }
    }

    // Setup tokenize form validation
    setupTokenizeFormValidation() {
        const form = document.getElementById('tokenizeForm');
        const inputs = {
            cropType: document.getElementById('cropType'),
            cropQuantity: document.getElementById('cropQuantity'),
            qualityGrade: document.getElementById('qualityGrade'),
            warehouseLocation: document.getElementById('warehouseLocation')
        };

        // Real-time validation on input change
        Object.entries(inputs).forEach(([key, input]) => {
            if (input) {
                input.addEventListener('input', () => this.validateField(input, key));
                input.addEventListener('blur', () => this.validateField(input, key));
            }
        });

        // Quantity calculation on change
        inputs.cropQuantity?.addEventListener('input', () => {
            this.calculateTokenValue();
        });

        inputs.cropType?.addEventListener('change', () => {
            this.calculateTokenValue();
        });

        inputs.qualityGrade?.addEventListener('change', () => {
            this.calculateTokenValue();
        });
    }

    // Setup loan form validation
    setupLoanFormValidation() {
        const form = document.getElementById('loanForm');
        const inputs = {
            loanAmount: document.getElementById('loanAmount'),
            collateralToken: document.getElementById('collateralToken'),
            loanPurpose: document.getElementById('loanPurpose'),
            repaymentPeriod: document.getElementById('repaymentPeriod')
        };

        // Real-time validation
        Object.entries(inputs).forEach(([key, input]) => {
            if (input) {
                input.addEventListener('input', () => this.validateField(input, key));
                input.addEventListener('change', () => this.validateField(input, key));
            }
        });

        // Loan calculation on change
        inputs.loanAmount?.addEventListener('input', () => {
            this.calculateLoanTerms();
        });

        inputs.repaymentPeriod?.addEventListener('change', () => {
            this.calculateLoanTerms();
        });

        // Populate collateral options
        this.populateCollateralOptions();
    }

    // Validate individual field
    validateField(input, fieldType) {
        const formGroup = input.closest('.form-group');
        const validationMessage = formGroup.querySelector('.validation-message');
        let isValid = true;
        let message = '';

        // Remove existing validation classes
        formGroup.classList.remove('error', 'success');

        switch (fieldType) {
            case 'cropType':
                isValid = input.value !== '';
                message = 'Veuillez sélectionner un type de récolte';
                break;

            case 'cropQuantity':
                const quantity = parseFloat(input.value);
                isValid = !isNaN(quantity) && quantity >= 100;
                message = isValid ? '' : 'La quantité doit être d\'au moins 100kg';
                break;

            case 'qualityGrade':
                isValid = input.value !== '';
                message = 'Veuillez sélectionner un grade';
                break;

            case 'warehouseLocation':
                isValid = input.value.trim().length >= 3;
                message = isValid ? '' : 'Veuillez indiquer le lieu de stockage (min. 3 caractères)';
                break;

            case 'loanAmount':
                const amount = parseFloat(input.value);
                isValid = !isNaN(amount) && amount >= 100 && amount <= 50000;
                message = isValid ? '' : 'Montant entre $100 et $50,000';
                break;

            case 'supportName':
                isValid = input.value.trim().length >= 2;
                message = isValid ? '' : 'Veuillez entrer votre nom (min. 2 caractères)';
                break;

            case 'supportEmail':
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                isValid = emailRegex.test(input.value);
                message = isValid ? '' : 'Veuillez entrer un email valide';
                break;

            case 'supportMessage':
                isValid = input.value.trim().length >= 10;
                message = isValid ? '' : 'Message trop court (min. 10 caractères)';
                break;
        }

        // Apply validation styles
        if (input.value && input.required) {
            formGroup.classList.add(isValid ? 'success' : 'error');
            validationMessage.textContent = message;
        }

        return isValid;
    }

    // Calculate token value in real-time
    calculateTokenValue() {
        const cropType = document.getElementById('cropType')?.value;
        const quantity = parseFloat(document.getElementById('cropQuantity')?.value) || 0;
        const grade = document.getElementById('qualityGrade')?.value || 'B';

        if (cropType && quantity >= 100) {
            const basePrice = this.cropPrices[cropType] || 3.00;
            const gradeMultiplier = { A: 1.2, B: 1.0, C: 0.8 }[grade] || 1.0;
            const totalValue = quantity * basePrice * gradeMultiplier;
            const maxLoan = totalValue * 0.75; // 75% LTV

            document.getElementById('estimatedValue').textContent = `$${totalValue.toLocaleString()}`;
            document.getElementById('maxLoanAmount').textContent = `$${maxLoan.toLocaleString()}`;
            document.getElementById('estimatedValueDisplay').style.display = 'block';

            // Add animation
            const display = document.getElementById('estimatedValueDisplay');
            display.style.animation = 'slideUp 0.3s ease';
        } else {
            document.getElementById('estimatedValueDisplay').style.display = 'none';
        }
    }

    // Calculate loan terms in real-time
    calculateLoanTerms() {
        const loanAmount = parseFloat(document.getElementById('loanAmount')?.value) || 0;
        const repaymentMonths = parseInt(document.getElementById('repaymentPeriod')?.value) || 6;

        if (loanAmount >= 100) {
            const annualRate = 0.085; // 8.5% APR
            const monthlyRate = annualRate / 12;
            const monthlyPayment = loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, repaymentMonths)) /
                                 (Math.pow(1 + monthlyRate, repaymentMonths) - 1);
            const totalRepayment = monthlyPayment * repaymentMonths;

            document.getElementById('monthlyPayment').textContent = `$${monthlyPayment.toFixed(2)}`;
            document.getElementById('totalRepayment').textContent = `$${totalRepayment.toFixed(2)}`;
            document.getElementById('loanSummaryDisplay').style.display = 'block';

            // Update collateral requirement
            const collateralRequired = loanAmount / 0.75; // Assuming 75% LTV
            document.getElementById('summaryCollateral').textContent = `$${collateralRequired.toLocaleString()} valeur`;

            // Add animation
            const display = document.getElementById('loanSummaryDisplay');
            display.style.animation = 'slideUp 0.3s ease';
        } else {
            document.getElementById('loanSummaryDisplay').style.display = 'none';
        }
    }

    // Populate collateral options from user's tokens
    populateCollateralOptions() {
        const select = document.getElementById('collateralToken');
        if (!select) return;

        // Clear existing options
        select.innerHTML = '<option value="">Sélectionnez votre garantie</option>';

        // Get user's tokens (mock data for now)
        const userTokens = this.app.mockData?.tokens || [
            { id: '0.0.123456', cropType: 'maize', quantity: 1500, value: 4800, grade: 'A' },
            { id: '0.0.123457', cropType: 'coffee', quantity: 200, value: 3000, grade: 'B' }
        ];

        userTokens.forEach(token => {
            const option = document.createElement('option');
            option.value = token.id;
            option.textContent = `${this.getCropEmoji(token.cropType)} ${token.quantity}kg ${token.cropType} (Grade ${token.grade}) - $${token.value.toLocaleString()}`;
            select.appendChild(option);
        });

        if (userTokens.length === 0) {
            const option = document.createElement('option');
            option.textContent = 'Aucun reçu numérique disponible';
            option.disabled = true;
            select.appendChild(option);
        }
    }

    // Get crop emoji
    getCropEmoji(cropType) {
        const emojis = {
            maize: '🌽',
            rice: '🌾',
            wheat: '🌾',
            coffee: '☕',
            cocoa: '🍫',
            beans: '🫘'
        };
        return emojis[cropType] || '🌱';
    }

    // Setup form enhancements
    setupFormEnhancements() {
        // Auto-save drafts
        this.setupAutoSave();

        // Enhanced UX interactions
        this.setupFormInteractions();

        // Accessibility enhancements
        this.setupAccessibilityFeatures();
    }

    // Setup auto-save for drafts
    setupAutoSave() {
        const forms = ['tokenizeForm', 'loanForm'];

        forms.forEach(formId => {
            const form = document.getElementById(formId);
            if (form) {
                // Load saved draft
                this.loadFormDraft(formId);

                // Auto-save on change
                form.addEventListener('input', () => {
                    this.saveFormDraft(formId);
                });
            }
        });
    }

    // Save form draft to localStorage
    saveFormDraft(formId) {
        const form = document.getElementById(formId);
        if (!form) return;

        const formData = new FormData(form);
        const data = {};

        for (let [key, value] of formData.entries()) {
            data[key] = value;
        }

        // Include non-FormData inputs
        form.querySelectorAll('input, select, textarea').forEach(input => {
            if (input.id) {
                data[input.id] = input.value;
            }
        });

        localStorage.setItem(`draft_${formId}`, JSON.stringify({
            data,
            timestamp: Date.now()
        }));
    }

    // Load form draft from localStorage
    loadFormDraft(formId) {
        const draft = localStorage.getItem(`draft_${formId}`);
        if (!draft) return;

        try {
            const { data, timestamp } = JSON.parse(draft);

            // Only load if draft is less than 24 hours old
            if (Date.now() - timestamp > 24 * 60 * 60 * 1000) {
                localStorage.removeItem(`draft_${formId}`);
                return;
            }

            // Populate form fields
            Object.entries(data).forEach(([key, value]) => {
                const input = document.getElementById(key);
                if (input && value) {
                    input.value = value;

                    // Trigger validation and calculations
                    input.dispatchEvent(new Event('input'));
                }
            });

            // Show draft notification
            this.showDraftNotification(formId);

        } catch (error) {
            console.error('Error loading form draft:', error);
        }
    }

    // Show draft loaded notification
    showDraftNotification(formId) {
        const notification = document.createElement('div');
        notification.className = 'draft-notification';
        notification.innerHTML = `
            <div class="notification-content">
                <i class="fas fa-save" aria-hidden="true"></i>
                <div>
                    <strong>Brouillon restauré</strong>
                    <p>Vos données ont été automatiquement restaurées</p>
                </div>
                <button class="btn-link" onclick="formManager.clearDraft('${formId}')">
                    Effacer
                </button>
            </div>
        `;

        document.body.appendChild(notification);

        setTimeout(() => notification.classList.add('show'), 100);
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        }, 5000);
    }

    // Clear form draft
    clearDraft(formId) {
        localStorage.removeItem(`draft_${formId}`);

        // Clear form
        const form = document.getElementById(formId);
        if (form) {
            form.reset();

            // Hide calculation displays
            const displays = ['estimatedValueDisplay', 'loanSummaryDisplay'];
            displays.forEach(id => {
                const el = document.getElementById(id);
                if (el) el.style.display = 'none';
            });
        }

        // Remove notification
        document.querySelector('.draft-notification')?.remove();
    }

    // Setup form interactions
    setupFormInteractions() {
        // Enhanced modal opening
        this.enhanceModalOpening();

        // Form submission handlers
        this.setupFormSubmissions();

        // Keyboard shortcuts
        this.setupKeyboardShortcuts();
    }

    // Enhance modal opening experience
    enhanceModalOpening() {
        // Override existing modal functions
        window.openTokenizeModal = () => {
            const modal = document.getElementById('tokenizeModal');
            modal.classList.add('active');

            // Focus first input for accessibility
            setTimeout(() => {
                const firstInput = modal.querySelector('select, input');
                firstInput?.focus();
            }, 300);

            // Track modal opening
            this.trackEvent('modal_opened', { modal: 'tokenize' });
        };

        window.openLoanModal = () => {
            // Check if user has tokens first
            if (!this.hasTokens()) {
                this.showTokenizeFirstPrompt();
                return;
            }

            const modal = document.getElementById('loanModal');
            modal.classList.add('active');

            // Populate collateral options
            this.populateCollateralOptions();

            // Focus first input
            setTimeout(() => {
                const firstInput = modal.querySelector('input');
                firstInput?.focus();
            }, 300);

            this.trackEvent('modal_opened', { modal: 'loan' });
        };

        window.openSupportModal = () => {
            const modal = document.getElementById('supportModal');
            modal.classList.add('active');

            // Pre-fill user info if available
            if (this.app.currentUser) {
                const nameInput = document.getElementById('supportName');
                const emailInput = document.getElementById('supportEmail');

                if (nameInput && this.app.currentUser.name) {
                    nameInput.value = this.app.currentUser.name;
                }
                if (emailInput && this.app.currentUser.email) {
                    emailInput.value = this.app.currentUser.email;
                }
            }

            // Focus first empty input
            setTimeout(() => {
                const firstEmpty = modal.querySelector('input:not([value]), textarea:not([value])');
                firstEmpty?.focus();
            }, 300);

            this.trackEvent('modal_opened', { modal: 'support' });
        };

        // Enhanced modal closing
        window.closeModal = (modalId) => {
            const modal = document.getElementById(modalId);
            if (modal) {
                modal.classList.remove('active');
                this.trackEvent('modal_closed', { modal: modalId });
            }
        };
    }

    // Setup form submissions
    setupFormSubmissions() {
        window.submitTokenizeForm = async () => {
            await this.handleTokenizeSubmission();
        };

        window.submitLoanForm = async () => {
            await this.handleLoanSubmission();
        };

        window.submitSupportForm = async () => {
            await this.handleSupportSubmission();
        };
    }

    // Handle tokenize form submission
    async handleTokenizeSubmission() {
        const form = document.getElementById('tokenizeForm');
        const submitBtn = form.closest('.modal').querySelector('.btn-primary');

        try {
            // Validate form
            if (!this.validateForm('tokenizeForm')) {
                this.showFormErrors();
                return;
            }

            // Show loading state
            this.setButtonLoading(submitBtn, true);

            // Prepare transaction data
            const formData = new FormData(form);
            const cropType = document.getElementById('cropType').value;
            const quantity = document.getElementById('cropQuantity').value;

            const transactionData = {
                title: 'Création de reçu numérique',
                description: `Tokenisation de ${quantity}kg de ${cropType}`,
                amount: `${quantity}kg ${cropType}`,
                estimatedFee: '$0.05',
                estimatedTime: '3-5 secondes',
                successMessage: '🎉 Votre reçu numérique a été créé avec succès!',
                breakdown: [
                    { label: 'Quantité', value: `${quantity}kg` },
                    { label: 'Grade', value: document.getElementById('qualityGrade').value },
                    { label: 'Entrepôt', value: document.getElementById('warehouseLocation').value }
                ]
            };

            // Process transaction
            if (this.app.txManager) {
                await this.app.txManager.processTransaction(
                    async () => {
                        // Simulate tokenization process
                        await new Promise(resolve => setTimeout(resolve, 2000));
                        return {
                            txHash: '0x' + Math.random().toString(36).substr(2, 64),
                            tokenId: '0.0.' + Math.floor(Math.random() * 999999)
                        };
                    },
                    transactionData
                );
            }

            // Clear draft and close modal
            this.clearDraft('tokenizeForm');
            closeModal('tokenizeModal');

            // Refresh dashboard
            if (this.app.dashboard) {
                this.app.dashboard.loadDashboardData();
            }

        } catch (error) {
            console.error('Tokenization failed:', error);
            this.showError('Échec de la tokenisation. Veuillez réessayer.');
        } finally {
            this.setButtonLoading(submitBtn, false);
        }
    }

    // Handle loan form submission
    async handleLoanSubmission() {
        const form = document.getElementById('loanForm');
        const submitBtn = form.closest('.modal').querySelector('.btn-primary');

        try {
            if (!this.validateForm('loanForm')) {
                this.showFormErrors();
                return;
            }

            this.setButtonLoading(submitBtn, true);

            const loanAmount = document.getElementById('loanAmount').value;
            const purpose = document.getElementById('loanPurpose').selectedOptions[0].text;

            const transactionData = {
                title: 'Demande de financement',
                description: `Prêt de $${loanAmount} pour ${purpose}`,
                amount: `$${loanAmount}`,
                estimatedFee: '$0.03',
                estimatedTime: '2-4 secondes',
                successMessage: '💰 Votre demande de prêt a été soumise avec succès!'
            };

            if (this.app.txManager) {
                await this.app.txManager.processTransaction(
                    async () => {
                        await new Promise(resolve => setTimeout(resolve, 1500));
                        return {
                            txHash: '0x' + Math.random().toString(36).substr(2, 64),
                            loanId: 'AF-' + Date.now()
                        };
                    },
                    transactionData
                );
            }

            this.clearDraft('loanForm');
            closeModal('loanModal');

            if (this.app.dashboard) {
                this.app.dashboard.loadDashboardData();
            }

        } catch (error) {
            console.error('Loan submission failed:', error);
            this.showError('Échec de la soumission. Veuillez réessayer.');
        } finally {
            this.setButtonLoading(submitBtn, false);
        }
    }

    // Handle support form submission
    async handleSupportSubmission() {
        const form = document.getElementById('supportForm');
        const submitBtn = form.closest('.modal').querySelector('.btn-primary');

        try {
            if (!this.validateForm('supportForm')) {
                this.showFormErrors();
                return;
            }

            this.setButtonLoading(submitBtn, true);

            // Simulate sending support message
            await new Promise(resolve => setTimeout(resolve, 1000));

            // Show success message
            this.showSuccess('✅ Votre message a été envoyé avec succès! Notre équipe vous répondra sous 24h.');

            // Clear form and close modal
            form.reset();
            closeModal('supportModal');

        } catch (error) {
            console.error('Support submission failed:', error);
            this.showError('Échec de l\'envoi. Veuillez réessayer.');
        } finally {
            this.setButtonLoading(submitBtn, false);
        }
    }

    // Validate entire form
    validateForm(formId) {
        const form = document.getElementById(formId);
        if (!form) return false;

        let isValid = true;
        const inputs = form.querySelectorAll('input[required], select[required], textarea[required]');

        inputs.forEach(input => {
            const fieldType = input.id || input.name;
            if (!this.validateField(input, fieldType)) {
                isValid = false;
            }
        });

        return isValid;
    }

    // Show form errors
    showFormErrors() {
        const errorGroups = document.querySelectorAll('.form-group.error');
        if (errorGroups.length > 0) {
            // Scroll to first error
            errorGroups[0].scrollIntoView({ behavior: 'smooth', block: 'center' });

            // Focus first error input
            const firstErrorInput = errorGroups[0].querySelector('input, select, textarea');
            firstErrorInput?.focus();
        }
    }

    // Set button loading state
    setButtonLoading(button, isLoading) {
        if (isLoading) {
            button.classList.add('loading');
            button.disabled = true;
            button.setAttribute('aria-busy', 'true');
        } else {
            button.classList.remove('loading');
            button.disabled = false;
            button.setAttribute('aria-busy', 'false');
        }
    }

    // Check if user has tokens
    hasTokens() {
        return this.app.mockData?.tokens && this.app.mockData.tokens.length > 0;
    }

    // Show prompt to tokenize first
    showTokenizeFirstPrompt() {
        const prompt = document.createElement('div');
        prompt.className = 'prompt-modal modal active';
        prompt.innerHTML = `
            <div class="modal-content">
                <div class="modal-body" style="text-align: center; padding: 2rem;">
                    <div class="prompt-icon" style="font-size: 3rem; margin-bottom: 1rem;">
                        <i class="fas fa-info-circle" style="color: var(--primary-color);"></i>
                    </div>
                    <h3>Créez d'abord un reçu numérique</h3>
                    <p>Pour demander un prêt, vous devez d'abord créer un reçu numérique de vos récoltes qui servira de garantie.</p>
                    <div class="prompt-actions" style="display: flex; gap: 1rem; justify-content: center; margin-top: 1.5rem;">
                        <button class="btn-secondary" onclick="this.closest('.prompt-modal').remove()">
                            <i class="fas fa-times"></i> Annuler
                        </button>
                        <button class="btn-primary" onclick="this.closest('.prompt-modal').remove(); openTokenizeModal()">
                            <i class="fas fa-plus-circle"></i> Créer un reçu
                        </button>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(prompt);

        // Focus primary button
        setTimeout(() => {
            prompt.querySelector('.btn-primary').focus();
        }, 300);
    }

    // Setup keyboard shortcuts
    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Ctrl/Cmd + T = Tokenize
            if ((e.ctrlKey || e.metaKey) && e.key === 't' && !document.querySelector('.modal.active')) {
                e.preventDefault();
                openTokenizeModal();
            }

            // Ctrl/Cmd + L = Loan
            if ((e.ctrlKey || e.metaKey) && e.key === 'l' && !document.querySelector('.modal.active')) {
                e.preventDefault();
                openLoanModal();
            }

            // Escape = Close modal
            if (e.key === 'Escape') {
                const activeModal = document.querySelector('.modal.active');
                if (activeModal) {
                    closeModal(activeModal.id);
                }
            }
        });
    }

    // Setup accessibility features
    setupAccessibilityFeatures() {
        // Add aria-describedby for help text
        document.querySelectorAll('.form-group').forEach(group => {
            const input = group.querySelector('input, select, textarea');
            const helpText = group.querySelector('.help-text');
            const validation = group.querySelector('.validation-message');

            if (input && (helpText || validation)) {
                const describedBy = [];

                if (helpText) {
                    const helpId = `help-${input.id}`;
                    helpText.id = helpId;
                    describedBy.push(helpId);
                }

                if (validation) {
                    const validationId = `validation-${input.id}`;
                    validation.id = validationId;
                    describedBy.push(validationId);
                }

                input.setAttribute('aria-describedby', describedBy.join(' '));
            }
        });
    }

    // Utility methods
    showError(message) {
        const notification = document.createElement('div');
        notification.className = 'error-notification show';
        notification.innerHTML = `
            <div class="notification-content">
                <i class="fas fa-exclamation-triangle"></i>
                <div class="notification-text">
                    <strong>Erreur</strong>
                    <p>${message}</p>
                </div>
            </div>
        `;

        document.body.appendChild(notification);

        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        }, 5000);
    }

    showSuccess(message) {
        const notification = document.createElement('div');
        notification.className = 'success-toast show';
        notification.innerHTML = `
            <div class="notification-content">
                <i class="fas fa-check-circle"></i>
                <div class="notification-text">
                    <p>${message}</p>
                </div>
            </div>
        `;

        document.body.appendChild(notification);

        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        }, 4000);
    }

    trackEvent(eventName, properties = {}) {
        if (typeof gtag !== 'undefined') {
            gtag('event', eventName, properties);
        }

        // Store for offline analytics
        const events = JSON.parse(localStorage.getItem('analyticsQueue') || '[]');
        events.push({ event: eventName, properties, timestamp: Date.now() });
        localStorage.setItem('analyticsQueue', JSON.stringify(events));
    }
}

// Global form manager instance
window.formManager = null;

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    const initFormManager = () => {
        if (window.app) {
            window.formManager = new FormManager(window.app);
            window.formManager.init();
        } else {
            setTimeout(initFormManager, 100);
        }
    };

    initFormManager();
});
