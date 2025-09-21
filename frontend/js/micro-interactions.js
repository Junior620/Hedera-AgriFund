// Micro-interactions and Smooth Animations
class MicroInteractions {
    constructor() {
        this.init();
    }

    init() {
        this.setupButtonAnimations();
        this.setupCardHovers();
        this.setupFormInteractions();
        this.setupScrollAnimations();
        this.setupLoadingStates();
    }

    setupButtonAnimations() {
        document.addEventListener('click', (e) => {
            if (e.target.matches('button, .btn')) {
                this.createRippleEffect(e);
                this.addClickFeedback(e.target);
            }
        });

        // Hover effects
        document.addEventListener('mouseover', (e) => {
            if (e.target.matches('button, .btn')) {
                this.addHoverEffect(e.target);
            }
        });
    }

    createRippleEffect(e) {
        const button = e.target;
        const rect = button.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const x = e.clientX - rect.left - size / 2;
        const y = e.clientY - rect.top - size / 2;

        const ripple = document.createElement('span');
        ripple.style.cssText = `
            position: absolute;
            width: ${size}px;
            height: ${size}px;
            left: ${x}px;
            top: ${y}px;
            background: rgba(255, 255, 255, 0.3);
            border-radius: 50%;
            transform: scale(0);
            animation: ripple 0.6s ease-out;
            pointer-events: none;
        `;

        if (!document.getElementById('ripple-styles')) {
            const styles = document.createElement('style');
            styles.id = 'ripple-styles';
            styles.textContent = `
                @keyframes ripple {
                    to {
                        transform: scale(2);
                        opacity: 0;
                    }
                }
                button, .btn {
                    position: relative;
                    overflow: hidden;
                }
            `;
            document.head.appendChild(styles);
        }

        button.appendChild(ripple);
        setTimeout(() => ripple.remove(), 600);
    }

    addClickFeedback(element) {
        element.style.transform = 'scale(0.95)';
        setTimeout(() => {
            element.style.transform = '';
        }, 150);
    }

    addHoverEffect(element) {
        if (!element.dataset.hoverSetup) {
            element.dataset.hoverSetup = 'true';
            element.style.transition = 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
            
            element.addEventListener('mouseenter', () => {
                element.style.transform = 'translateY(-2px)';
                element.style.boxShadow = '0 8px 25px rgba(0, 0, 0, 0.15)';
            });
            
            element.addEventListener('mouseleave', () => {
                element.style.transform = '';
                element.style.boxShadow = '';
            });
        }
    }

    setupCardHovers() {
        const cards = document.querySelectorAll('.dashboard-card, .loan-card, .token-card, .calculator-card');
        
        cards.forEach(card => {
            card.addEventListener('mouseenter', () => {
                card.style.transform = 'translateY(-4px) scale(1.02)';
                card.style.boxShadow = '0 12px 40px rgba(0, 0, 0, 0.15)';
            });
            
            card.addEventListener('mouseleave', () => {
                card.style.transform = '';
                card.style.boxShadow = '';
            });
        });
    }

    setupFormInteractions() {
        // Floating labels
        document.querySelectorAll('input, textarea, select').forEach(field => {
            const wrapper = field.closest('.form-group');
            if (!wrapper) return;

            field.addEventListener('focus', () => {
                wrapper.classList.add('focused');
                this.addFieldGlow(field);
            });

            field.addEventListener('blur', () => {
                if (!field.value) {
                    wrapper.classList.remove('focused');
                }
                this.removeFieldGlow(field);
            });

            field.addEventListener('input', () => {
                this.addTypingEffect(field);
            });
        });
    }

    addFieldGlow(field) {
        field.style.boxShadow = '0 0 0 3px rgba(0, 212, 170, 0.1)';
        field.style.borderColor = 'var(--primary-color)';
    }

    removeFieldGlow(field) {
        field.style.boxShadow = '';
        field.style.borderColor = '';
    }

    addTypingEffect(field) {
        field.style.transform = 'scale(1.01)';
        setTimeout(() => {
            field.style.transform = '';
        }, 100);
    }

    setupScrollAnimations() {
        // Parallax scrolling
        window.addEventListener('scroll', this.throttle(() => {
            const scrolled = window.pageYOffset;
            
            // Hero parallax
            const hero = document.querySelector('.hero-background');
            if (hero) {
                hero.style.transform = `translateY(${scrolled * 0.5}px)`;
            }

            // Stagger animations for cards
            const cards = document.querySelectorAll('.dashboard-card, .loan-card, .token-card');
            cards.forEach((card, index) => {
                const rect = card.getBoundingClientRect();
                if (rect.top < window.innerHeight && rect.bottom > 0) {
                    card.style.animationDelay = `${index * 0.1}s`;
                    card.classList.add('animate-in');
                }
            });
        }, 16));
    }

    setupLoadingStates() {
        // Enhanced loading animations
        const style = document.createElement('style');
        style.textContent = `
            .animate-in {
                animation: slideInUp 0.6s cubic-bezier(0.4, 0, 0.2, 1) forwards;
            }
            
            @keyframes slideInUp {
                from {
                    opacity: 0;
                    transform: translateY(30px);
                }
                to {
                    opacity: 1;
                    transform: translateY(0);
                }
            }
            
            .loading-pulse {
                animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
            }
            
            @keyframes pulse {
                0%, 100% {
                    opacity: 1;
                }
                50% {
                    opacity: 0.5;
                }
            }
            
            .success-bounce {
                animation: successBounce 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55);
            }
            
            @keyframes successBounce {
                0% {
                    transform: scale(0.3);
                    opacity: 0;
                }
                50% {
                    transform: scale(1.05);
                }
                70% {
                    transform: scale(0.9);
                }
                100% {
                    transform: scale(1);
                    opacity: 1;
                }
            }
            
            .shake {
                animation: shake 0.5s cubic-bezier(0.36, 0.07, 0.19, 0.97);
            }
            
            @keyframes shake {
                10%, 90% {
                    transform: translate3d(-1px, 0, 0);
                }
                20%, 80% {
                    transform: translate3d(2px, 0, 0);
                }
                30%, 50%, 70% {
                    transform: translate3d(-4px, 0, 0);
                }
                40%, 60% {
                    transform: translate3d(4px, 0, 0);
                }
            }
        `;
        document.head.appendChild(style);
    }

    // Utility methods
    showSuccess(element) {
        element.classList.add('success-bounce');
        setTimeout(() => element.classList.remove('success-bounce'), 600);
    }

    showError(element) {
        element.classList.add('shake');
        setTimeout(() => element.classList.remove('shake'), 500);
    }

    throttle(func, limit) {
        let inThrottle;
        return function() {
            const args = arguments;
            const context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }
}

// Initialize micro-interactions
document.addEventListener('DOMContentLoaded', () => {
    window.microInteractions = new MicroInteractions();
});