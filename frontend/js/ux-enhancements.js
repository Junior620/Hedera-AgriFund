// UX Enhancement Functions for Hedera AgriFund

class UXEnhancements {
    constructor() {
        this.init();
    }

    init() {
        this.setupStickyNavigation();
        this.setupSmoothScrolling();
        this.setupFormValidation();
        this.setupLoadingStates();
        this.setupToastNotifications();
        this.setupKeyboardNavigation();
        this.setupProgressiveDisclosure();
        this.setupAnalytics();
    }

    // Sticky Navigation with scroll detection
    setupStickyNavigation() {
        const navbar = document.querySelector('.navbar');
        let lastScrollY = window.scrollY;

        window.addEventListener('scroll', () => {
            const currentScrollY = window.scrollY;
            
            if (currentScrollY > 100) {
                navbar.classList.add('scrolled');
            } else {
                navbar.classList.remove('scrolled');
            }

            // Hide navbar on scroll down, show on scroll up
            if (currentScrollY > lastScrollY && currentScrollY > 200) {
                navbar.style.transform = 'translateY(-100%)';
            } else {
                navbar.style.transform = 'translateY(0)';
            }

            lastScrollY = currentScrollY;
        });
    }

    // Enhanced smooth scrolling with offset for fixed header
    setupSmoothScrolling() {
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', (e) => {
                e.preventDefault();
                const target = document.querySelector(anchor.getAttribute('href'));
                if (target) {
                    const offsetTop = target.offsetTop - 80; // Account for fixed header
                    window.scrollTo({
                        top: offsetTop,
                        behavior: 'smooth'
                    });
                }
            });
        });
    }

    // Real-time form validation
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
        const value = field.value.trim();
        const type = field.type;
        let isValid = true;
        let errorMessage = '';

        // Required field validation
        if (field.hasAttribute('required') && !value) {
            isValid = false;
            errorMessage = 'This field is required';
        }

        // Email validation
        if (type === 'email' && value) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(value)) {
                isValid = false;
                errorMessage = 'Please enter a valid email address';
            }
        }

        // Phone validation
        if (type === 'tel' && value) {
            const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
            if (!phoneRegex.test(value.replace(/\s/g, ''))) {
                isValid = false;
                errorMessage = 'Please enter a valid phone number';
            }
        }

        this.showFieldValidation(field, isValid, errorMessage);
        return isValid;
    }

    showFieldValidation(field, isValid, errorMessage) {
        const existingError = field.parentNode.querySelector('.field-error');
        
        if (existingError) {
            existingError.remove();
        }

        if (!isValid) {
            field.classList.add('error');
            const errorElement = document.createElement('div');
            errorElement.className = 'field-error';
            errorElement.textContent = errorMessage;
            errorElement.setAttribute('role', 'alert');
            field.parentNode.appendChild(errorElement);
        } else {
            field.classList.remove('error');
        }
    }

    clearFieldError(field) {
        field.classList.remove('error');
        const existingError = field.parentNode.querySelector('.field-error');
        if (existingError) {
            existingError.remove();
        }
    }

    // Loading states for better perceived performance
    setupLoadingStates() {
        const buttons = document.querySelectorAll('button[type="submit"], .btn-primary');
        
        buttons.forEach(button => {
            button.addEventListener('click', (e) => {
                if (button.form && !button.form.checkValidity()) {
                    return;
                }
                
                this.showButtonLoading(button);
                
                // Simulate async operation
                setTimeout(() => {
                    this.hideButtonLoading(button);
                }, 2000);
            });
        });
    }

    showButtonLoading(button) {
        const originalText = button.innerHTML;
        button.dataset.originalText = originalText;
        button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';
        button.disabled = true;
        button.classList.add('loading');
    }

    hideButtonLoading(button) {
        button.innerHTML = button.dataset.originalText;
        button.disabled = false;
        button.classList.remove('loading');
    }

    // Toast notification system
    setupToastNotifications() {
        this.toastContainer = document.getElementById('notificationContainer');
    }

    showToast(message, type = 'info', duration = 5000) {
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        
        const icons = {
            success: 'fas fa-check-circle',
            error: 'fas fa-exclamation-circle',
            warning: 'fas fa-exclamation-triangle',
            info: 'fas fa-info-circle'
        };

        toast.innerHTML = `
            <i class="${icons[type]} toast-icon"></i>
            <div class="toast-content">
                <div class="toast-message">${message}</div>
            </div>
            <button class="toast-close" aria-label="Close notification">
                <i class="fas fa-times"></i>
            </button>
        `;

        const closeBtn = toast.querySelector('.toast-close');
        closeBtn.addEventListener('click', () => this.removeToast(toast));

        this.toastContainer.appendChild(toast);

        // Auto remove after duration
        setTimeout(() => this.removeToast(toast), duration);

        return toast;
    }

    removeToast(toast) {
        toast.style.animation = 'toastSlideOut 0.3s ease-in forwards';
        setTimeout(() => {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
        }, 300);
    }

    // Enhanced keyboard navigation
    setupKeyboardNavigation() {
        // Escape key to close modals
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                const openModal = document.querySelector('.modal-overlay');
                if (openModal) {
                    this.closeModal(openModal);
                }
            }
        });

        // Tab trap for modals
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Tab') {
                const modal = document.querySelector('.modal-overlay');
                if (modal) {
                    this.trapFocus(e, modal);
                }
            }
        });
    }

    trapFocus(e, container) {
        const focusableElements = container.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (e.shiftKey) {
            if (document.activeElement === firstElement) {
                lastElement.focus();
                e.preventDefault();
            }
        } else {
            if (document.activeElement === lastElement) {
                firstElement.focus();
                e.preventDefault();
            }
        }
    }

    // Progressive disclosure for complex forms
    setupProgressiveDisclosure() {
        const advancedSections = document.querySelectorAll('.advanced-options');
        
        advancedSections.forEach(section => {
            const toggle = section.querySelector('.toggle-advanced');
            const content = section.querySelector('.advanced-content');
            
            if (toggle && content) {
                content.style.display = 'none';
                
                toggle.addEventListener('click', () => {
                    const isHidden = content.style.display === 'none';
                    content.style.display = isHidden ? 'block' : 'none';
                    toggle.textContent = isHidden ? 'Hide Advanced Options' : 'Show Advanced Options';
                    toggle.setAttribute('aria-expanded', isHidden);
                });
            }
        });
    }

    // Analytics tracking for UX improvements
    setupAnalytics() {
        // Track button clicks
        document.querySelectorAll('button, .btn').forEach(button => {
            button.addEventListener('click', (e) => {
                const buttonText = button.textContent.trim();
                const buttonId = button.id || button.dataset.testid || 'unknown';
                
                this.trackEvent('button_click', {
                    button_text: buttonText,
                    button_id: buttonId,
                    page_section: this.getCurrentSection(button)
                });
            });
        });

        // Track form interactions
        document.querySelectorAll('form').forEach(form => {
            form.addEventListener('submit', (e) => {
                this.trackEvent('form_submit', {
                    form_id: form.id || 'unknown',
                    form_type: form.dataset.type || 'unknown'
                });
            });
        });

        // Track scroll depth
        let maxScroll = 0;
        window.addEventListener('scroll', () => {
            const scrollPercent = Math.round(
                (window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100
            );
            
            if (scrollPercent > maxScroll) {
                maxScroll = scrollPercent;
                
                if (maxScroll % 25 === 0) { // Track at 25%, 50%, 75%, 100%
                    this.trackEvent('scroll_depth', {
                        percent: maxScroll
                    });
                }
            }
        });
    }

    getCurrentSection(element) {
        const sections = ['hero', 'metrics-strip', 'value-props', 'how-it-works', 'pricing', 'faq'];
        
        for (const section of sections) {
            const sectionElement = document.querySelector(`.${section}`);
            if (sectionElement && sectionElement.contains(element)) {
                return section;
            }
        }
        
        return 'unknown';
    }

    trackEvent(eventName, properties = {}) {
        // Integration with analytics services (Google Analytics, Mixpanel, etc.)
        if (typeof gtag !== 'undefined') {
            gtag('event', eventName, properties);
        }
        
        // Console log for development
        console.log('Analytics Event:', eventName, properties);
    }

    // Utility methods for modal management
    openModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.remove('hidden');
            document.body.style.overflow = 'hidden';
            
            // Focus first focusable element
            const firstFocusable = modal.querySelector('button, [href], input, select, textarea');
            if (firstFocusable) {
                firstFocusable.focus();
            }
        }
    }

    closeModal(modal) {
        modal.classList.add('hidden');
        document.body.style.overflow = '';
    }

    // Loan calculator utility
    calculateLoan(principal, rate, term) {
        const monthlyRate = rate / 100 / 12;
        const numPayments = term * 12;
        const monthlyPayment = principal * (monthlyRate * Math.pow(1 + monthlyRate, numPayments)) / 
                              (Math.pow(1 + monthlyRate, numPayments) - 1);
        
        return {
            monthlyPayment: Math.round(monthlyPayment * 100) / 100,
            totalPayment: Math.round(monthlyPayment * numPayments * 100) / 100,
            totalInterest: Math.round((monthlyPayment * numPayments - principal) * 100) / 100
        };
    }
}

// Initialize UX enhancements when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.uxEnhancements = new UXEnhancements();
});

// Global functions for backward compatibility
function openFarmerOnboarding() {
    window.uxEnhancements.showToast('Opening farmer onboarding...', 'info');
    window.uxEnhancements.trackEvent('farmer_onboarding_start');
}

function openLenderOnboarding() {
    window.uxEnhancements.showToast('Opening lender onboarding...', 'info');
    window.uxEnhancements.trackEvent('lender_onboarding_start');
}

function startFarmerOnboarding() {
    window.uxEnhancements.showToast('Starting loan application...', 'success');
    window.uxEnhancements.trackEvent('loan_application_start');
}

function watchDemo() {
    window.uxEnhancements.showToast('Loading demo video...', 'info');
    window.uxEnhancements.trackEvent('demo_video_play');
}