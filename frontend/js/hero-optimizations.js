// Hero Performance & UX Optimizations
class HeroOptimizations {
    constructor() {
        this.init();
    }

    init() {
        this.lazyLoadParticles();
        this.setupReducedMotion();
        this.setupCTATracking();
        this.setupLanguageDetection();
    }

    // Lazy load particles after idle
    lazyLoadParticles() {
        const loadParticles = () => {
            const particlesContainer = document.querySelector('.particles-container');
            if (particlesContainer) {
                particlesContainer.classList.add('loaded');
            }
            
            // Initialize Three.js hero canvas
            if (window.initHeroCanvas) {
                window.initHeroCanvas();
            }
        };

        if ('requestIdleCallback' in window) {
            requestIdleCallback(loadParticles);
        } else {
            setTimeout(loadParticles, 500);
        }
    }

    // Handle reduced motion preference
    setupReducedMotion() {
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            document.body.classList.add('reduced-motion');
            
            // Disable hero card tilt
            const heroCard = document.querySelector('.hero-card');
            if (heroCard) {
                heroCard.style.transform = 'none';
            }
        }
    }

    // Track CTA interactions
    setupCTATracking() {
        const primaryCTA = document.querySelector('.btn-hero-primary');
        const secondaryCTA = document.querySelector('.btn-hero-ghost');
        const lenderLink = document.querySelector('.persona-switch a');

        if (primaryCTA) {
            primaryCTA.addEventListener('click', () => {
                this.trackEvent('hero_cta_primary', 'get_loan');
            });
        }

        if (secondaryCTA) {
            secondaryCTA.addEventListener('click', () => {
                this.trackEvent('hero_cta_secondary', 'watch_demo');
            });
        }

        if (lenderLink) {
            lenderLink.addEventListener('click', () => {
                this.trackEvent('hero_persona_switch', 'lender');
            });
        }
    }

    // Auto-detect language on first visit
    setupLanguageDetection() {
        const hasLanguagePreference = localStorage.getItem('language');
        
        if (!hasLanguagePreference) {
            const browserLang = navigator.language.toLowerCase();
            const supportedLangs = ['fr', 'en'];
            
            let detectedLang = 'en'; // default
            if (browserLang.startsWith('fr')) {
                detectedLang = 'fr';
            }
            
            // Update language buttons
            document.querySelectorAll('.language-btn').forEach(btn => {
                btn.classList.remove('active');
                if (btn.dataset.lang === detectedLang) {
                    btn.classList.add('active');
                }
            });
            
            localStorage.setItem('language', detectedLang);
        }
    }

    // Simple analytics tracking
    trackEvent(action, label) {
        // Replace with your analytics implementation
        if (typeof gtag !== 'undefined') {
            gtag('event', action, {
                event_category: 'hero_interaction',
                event_label: label
            });
        }
        
        console.log(`Track: ${action} - ${label}`);
    }

    // Show success toast for actions
    showSuccessToast(message) {
        if (window.toastManager) {
            window.toastManager.success(message);
        }
    }
}

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => {
    window.heroOptimizations = new HeroOptimizations();
});

// Global functions for button handlers
window.startFarmerOnboarding = () => {
    window.heroOptimizations.showSuccessToast('Redirecting to loan application...');
    // Add actual redirect logic here
    setTimeout(() => {
        window.location.href = '/farmer-onboarding';
    }, 1000);
};

window.watchDemo = () => {
    window.heroOptimizations.trackEvent('demo_modal_open', 'hero');
    // Open demo modal
    console.log('Opening demo modal...');
};

window.openLenderOnboarding = () => {
    window.heroOptimizations.showSuccessToast('Redirecting to investor portal...');
    setTimeout(() => {
        window.location.href = '/lender-onboarding';
    }, 1000);
};