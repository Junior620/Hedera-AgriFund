// Enhanced Onboarding System for Hedera AgriFund
class OnboardingWizard {
    constructor(uxEnhancements) {
        this.ux = uxEnhancements;
        this.currentStep = 1;
        this.maxSteps = 3;
        this.userRole = null;
        this.isCompleted = localStorage.getItem('userOnboarded') === 'true';
        this.startTime = Date.now();
    }

    // Initialize the onboarding wizard
    init() {
        if (this.isCompleted) return;

        this.render();
        this.setupEventListeners();
        this.trackEvent('onboarding_started');
    }

    // Render the onboarding modal
    render() {
        const modalHTML = `
            <div id="onboardingWizard" class="onboarding-overlay" role="dialog" aria-modal="true" aria-labelledby="onboarding-title">
                <div class="onboarding-container">
                    <!-- Skip Link for Accessibility -->
                    <a href="#onboarding-content" class="skip-link">Aller au contenu</a>
                    
                    <div class="onboarding-progress" role="progressbar" aria-valuemin="1" aria-valuemax="3" aria-valuenow="1">
                        <div class="progress-bar">
                            <div class="progress-fill" id="onboardingProgress" style="width: 33%"></div>
                        </div>
                        <span class="progress-text">Étape <span id="currentStep">1</span> sur 3</span>
                    </div>
                    
                    <main id="onboarding-content" class="onboarding-content">
                        <!-- Dynamic content -->
                    </main>
                    
                    <div class="onboarding-actions">
                        <button class="btn-secondary" id="onboardingBack" style="display: none;" aria-label="Étape précédente">
                            <i class="fas fa-arrow-left" aria-hidden="true"></i> Précédent
                        </button>
                        <button class="btn-primary" id="onboardingNext" aria-label="Étape suivante">
                            Suivant <i class="fas fa-arrow-right" aria-hidden="true"></i>
                        </button>
                    </div>
                    
                    <div class="onboarding-skip">
                        <button class="btn-link" id="skipOnboarding" aria-label="Passer l'introduction">
                            Passer l'introduction
                        </button>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', modalHTML);
        this.showStep(1);

        // Focus management for accessibility
        const modal = document.getElementById('onboardingWizard');
        modal.focus();
    }

    // Setup event listeners
    setupEventListeners() {
        document.getElementById('onboardingNext').addEventListener('click', () => this.nextStep());
        document.getElementById('onboardingBack').addEventListener('click', () => this.previousStep());
        document.getElementById('skipOnboarding').addEventListener('click', () => this.skip());

        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && document.getElementById('onboardingWizard')) {
                this.skip();
            }
        });
    }

    // Show specific step
    showStep(step) {
        this.currentStep = step;
        const content = document.getElementById('onboarding-content');
        const progress = document.getElementById('onboardingProgress');
        const backBtn = document.getElementById('onboardingBack');
        const nextBtn = document.getElementById('onboardingNext');
        const stepEl = document.getElementById('currentStep');

        // Update progress
        stepEl.textContent = step;
        progress.style.width = `${(step / this.maxSteps) * 100}%`;
        progress.parentElement.setAttribute('aria-valuenow', step);
        backBtn.style.display = step > 1 ? 'inline-flex' : 'none';

        const steps = {
            1: this.getWelcomeStep(),
            2: this.getRoleSelectionStep(),
            3: this.getWalletConnectionStep()
        };

        if (steps[step]) {
            content.innerHTML = steps[step].content;
            nextBtn.textContent = steps[step].buttonText;
            nextBtn.disabled = steps[step].requiresValidation && !this.validateCurrentStep();
        }
    }

    // Step 1: Welcome
    getWelcomeStep() {
        return {
            content: `
                <div class="onboarding-step welcome-step">
                    <div class="step-illustration" aria-hidden="true">
                        <i class="fas fa-seedling"></i>
                    </div>
                    <h1 id="onboarding-title">Bienvenue sur Hedera AgriFund ! 🌾</h1>
                    <h2>La finance agricole, simplifiée</h2>
                    <p>Transformez vos récoltes en financement instantané grâce à la blockchain Hedera.</p>
                    
                    <ul class="benefits-list" role="list">
                        <li role="listitem">
                            <i class="fas fa-check-circle" aria-hidden="true"></i>
                            Taux d'intérêt compétitifs dès 6.5%
                        </li>
                        <li role="listitem">
                            <i class="fas fa-check-circle" aria-hidden="true"></i>
                            Financement en quelques minutes
                        </li>
                        <li role="listitem">
                            <i class="fas fa-check-circle" aria-hidden="true"></i>
                            Sécurisé par la blockchain
                        </li>
                    </ul>
                </div>
            `,
            buttonText: 'Commencer',
            requiresValidation: false
        };
    }

    // Step 2: Role Selection
    getRoleSelectionStep() {
        return {
            content: `
                <div class="onboarding-step role-step">
                    <h2>Qui êtes-vous ?</h2>
                    <p>Sélectionnez votre profil pour personnaliser votre expérience</p>
                    
                    <div class="role-selector" role="radiogroup" aria-labelledby="role-question">
                        <div class="role-option" data-role="farmer" tabindex="0" role="radio" aria-checked="false">
                            <div class="role-icon" aria-hidden="true">🚜</div>
                            <h3>Agriculteur</h3>
                            <p>Je cultive et j'ai besoin de financement</p>
                            <div class="role-features">
                                <small>• Créer des reçus numériques</small>
                                <small>• Accéder à des prêts</small>
                                <small>• Suivre mes récoltes</small>
                            </div>
                        </div>
                        
                        <div class="role-option" data-role="lender" tabindex="0" role="radio" aria-checked="false">
                            <div class="role-icon" aria-hidden="true">💰</div>
                            <h3>Investisseur</h3>
                            <p>Je veux investir dans l'agriculture</p>
                            <div class="role-features">
                                <small>• Explorer les opportunités</small>
                                <small>• Diversifier mon portefeuille</small>
                                <small>• Rendements attractifs</small>
                            </div>
                        </div>
                    </div>
                </div>
            `,
            buttonText: 'Continuer',
            requiresValidation: true
        };
    }

    // Step 3: Wallet Connection
    getWalletConnectionStep() {
        return {
            content: `
                <div class="onboarding-step wallet-step">
                    <h2>Connecter votre portefeuille</h2>
                    
                    <div class="wallet-explanation">
                        <div class="info-card">
                            <h3><i class="fas fa-shield-alt" aria-hidden="true"></i> Pourquoi un portefeuille ?</h3>
                            <ul role="list">
                                <li role="listitem">✓ Sécuriser vos actifs numériques</li>
                                <li role="listitem">✓ Signer les transactions de façon sécurisée</li>
                                <li role="listitem">✓ Garder le contrôle total de vos fonds</li>
                            </ul>
                        </div>
                    </div>
                    
                    <div class="wallet-options">
                        <h3>Choisissez votre portefeuille</h3>
                        <div class="wallet-buttons">
                            <button class="wallet-btn primary" data-wallet="hashpack" aria-label="Connecter avec HashPack">
                                <img src="assets/hashpack-logo.svg" alt="" aria-hidden="true">
                                <div>
                                    <strong>HashPack</strong>
                                    <small>Recommandé</small>
                                </div>
                            </button>
                            
                            <button class="wallet-btn" data-wallet="blade" aria-label="Connecter avec Blade">
                                <img src="assets/blade-logo.svg" alt="" aria-hidden="true">
                                <div>
                                    <strong>Blade</strong>
                                    <small>Alternative</small>
                                </div>
                            </button>
                        </div>
                        
                        <div class="wallet-status" id="walletStatus" aria-live="polite">
                            <!-- Status messages will appear here -->
                        </div>
                    </div>
                </div>
            `,
            buttonText: 'Terminer la configuration',
            requiresValidation: false
        };
    }

    // Navigate to next step
    nextStep() {
        if (this.currentStep < this.maxSteps) {
            if (this.validateCurrentStep()) {
                this.trackEvent('onboarding_step_completed', { step: this.currentStep });
                this.showStep(this.currentStep + 1);
            }
        } else {
            this.complete();
        }
    }

    // Navigate to previous step
    previousStep() {
        if (this.currentStep > 1) {
            this.showStep(this.currentStep - 1);
        }
    }

    // Validate current step
    validateCurrentStep() {
        switch (this.currentStep) {
            case 2: // Role selection
                const selected = document.querySelector('.role-option.selected');
                if (!selected) {
                    this.showValidationError('Veuillez sélectionner votre profil');
                    return false;
                }
                this.userRole = selected.dataset.role;
                return true;

            case 3: // Wallet connection (optional validation)
                return true;

            default:
                return true;
        }
    }

    // Show validation error
    showValidationError(message) {
        const existingError = document.querySelector('.validation-error');
        if (existingError) existingError.remove();

        const errorEl = document.createElement('div');
        errorEl.className = 'validation-error';
        errorEl.textContent = message;
        errorEl.setAttribute('role', 'alert');

        document.querySelector('.onboarding-content').appendChild(errorEl);

        setTimeout(() => errorEl.remove(), 3000);
    }

    // Skip onboarding
    skip() {
        if (confirm('Êtes-vous sûr de vouloir passer l\'introduction ?')) {
            this.trackEvent('onboarding_skipped', { step: this.currentStep });
            this.close();
            localStorage.setItem('onboardingSkipped', 'true');
        }
    }

    // Complete onboarding
    complete() {
        const duration = Date.now() - this.startTime;
        this.trackEvent('onboarding_completed', {
            duration,
            userRole: this.userRole
        });

        localStorage.setItem('userOnboarded', 'true');
        if (this.userRole) {
            localStorage.setItem('userRole', this.userRole);
        }

        this.close();
        this.showCompletionMessage();
    }

    // Close onboarding modal
    close() {
        const modal = document.getElementById('onboardingWizard');
        if (modal) {
            modal.remove();
        }
    }

    // Show completion message
    showCompletionMessage() {
        const message = document.createElement('div');
        message.className = 'completion-toast';
        message.innerHTML = `
            <div class="toast-content">
                <i class="fas fa-check-circle"></i>
                <div>
                    <strong>Configuration terminée !</strong>
                    <p>Bienvenue dans votre espace AgriFund</p>
                </div>
            </div>
        `;

        document.body.appendChild(message);

        setTimeout(() => {
            message.classList.add('show');
        }, 100);

        setTimeout(() => {
            message.remove();
            this.showNextSteps();
        }, 3000);
    }

    // Show next steps based on user role
    showNextSteps() {
        if (this.userRole === 'farmer') {
            this.ux.showFirstTimeGuide('tokenization');
        } else if (this.userRole === 'lender') {
            this.ux.showFirstTimeGuide('opportunities');
        }
    }

    // Track analytics events
    trackEvent(eventName, properties = {}) {
        if (typeof gtag !== 'undefined') {
            gtag('event', eventName, {
                ...properties,
                timestamp: Date.now()
            });
        }

        // Store for offline analytics
        const events = JSON.parse(localStorage.getItem('analyticsQueue') || '[]');
        events.push({
            event: eventName,
            properties: { ...properties, timestamp: Date.now() }
        });
        localStorage.setItem('analyticsQueue', JSON.stringify(events));
    }
}

// Initialize role selection interactions
document.addEventListener('DOMContentLoaded', () => {
    // Role selection handler
    document.addEventListener('click', (e) => {
        if (e.target.closest('.role-option')) {
            const option = e.target.closest('.role-option');
            const container = option.parentElement;

            // Remove previous selection
            container.querySelectorAll('.role-option').forEach(opt => {
                opt.classList.remove('selected');
                opt.setAttribute('aria-checked', 'false');
            });

            // Add selection
            option.classList.add('selected');
            option.setAttribute('aria-checked', 'true');

            // Enable next button
            const nextBtn = document.getElementById('onboardingNext');
            if (nextBtn) nextBtn.disabled = false;
        }
    });

    // Wallet connection handlers
    document.addEventListener('click', (e) => {
        if (e.target.closest('.wallet-btn')) {
            const btn = e.target.closest('.wallet-btn');
            const walletType = btn.dataset.wallet;
            handleWalletConnection(walletType);
        }
    });
});

// Handle wallet connection
async function handleWalletConnection(walletType) {
    const statusEl = document.getElementById('walletStatus');

    try {
        statusEl.innerHTML = `
            <div class="status-connecting">
                <i class="fas fa-spinner fa-spin" aria-hidden="true"></i>
                Connexion en cours...
            </div>
        `;

        // Simulate wallet connection (replace with actual implementation)
        await new Promise(resolve => setTimeout(resolve, 2000));

        statusEl.innerHTML = `
            <div class="status-success">
                <i class="fas fa-check-circle" aria-hidden="true"></i>
                Portefeuille connecté avec succès !
            </div>
        `;

        // Enable completion button
        const nextBtn = document.getElementById('onboardingNext');
        if (nextBtn) {
            nextBtn.disabled = false;
            nextBtn.textContent = 'Terminer';
        }

    } catch (error) {
        statusEl.innerHTML = `
            <div class="status-error">
                <i class="fas fa-exclamation-triangle" aria-hidden="true"></i>
                Erreur de connexion. Veuillez réessayer.
            </div>
        `;
    }
}

// Export for global use
window.OnboardingWizard = OnboardingWizard;
