// Accessibility Manager - A11y Improvements
class AccessibilityManager {
    constructor() {
        this.focusableElements = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';
        this.init();
    }

    init() {
        this.setupKeyboardNavigation();
        this.setupFocusManagement();
        this.setupARIALabels();
        this.setupScreenReaderSupport();
        this.setupColorContrast();
    }

    setupKeyboardNavigation() {
        document.addEventListener('keydown', (e) => {
            // Skip links for screen readers
            if (e.key === 'Tab' && e.shiftKey && document.activeElement === document.body) {
                this.createSkipLinks();
            }

            // Modal navigation
            if (e.key === 'Escape') {
                this.closeTopModal();
            }

            // Arrow key navigation for menus
            if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
                this.handleArrowNavigation(e);
            }
        });
    }

    setupFocusManagement() {
        // Focus trap for modals
        document.querySelectorAll('.modal').forEach(modal => {
            modal.addEventListener('keydown', (e) => {
                if (e.key === 'Tab') {
                    this.trapFocus(e, modal);
                }
            });
        });

        // Focus restoration
        this.focusHistory = [];
        document.addEventListener('focusin', (e) => {
            this.focusHistory.push(e.target);
            if (this.focusHistory.length > 10) {
                this.focusHistory.shift();
            }
        });
    }

    setupARIALabels() {
        // Auto-generate ARIA labels for buttons without text
        document.querySelectorAll('button:not([aria-label])').forEach(button => {
            const icon = button.querySelector('i');
            if (icon && !button.textContent.trim()) {
                const ariaLabel = this.getIconAriaLabel(icon.className);
                if (ariaLabel) {
                    button.setAttribute('aria-label', ariaLabel);
                }
            }
        });

        // Form field associations
        document.querySelectorAll('input, select, textarea').forEach(field => {
            const label = document.querySelector(`label[for="${field.id}"]`);
            if (!label && field.placeholder) {
                field.setAttribute('aria-label', field.placeholder);
            }
        });
    }

    setupScreenReaderSupport() {
        // Live regions for dynamic content
        this.createLiveRegion();

        // Progress announcements
        document.querySelectorAll('.progress-bar').forEach(progress => {
            progress.setAttribute('role', 'progressbar');
            progress.setAttribute('aria-valuemin', '0');
            progress.setAttribute('aria-valuemax', '100');
            
            const fill = progress.querySelector('.progress-fill');
            if (fill) {
                const value = parseInt(fill.style.width) || 0;
                progress.setAttribute('aria-valuenow', value);
                progress.setAttribute('aria-valuetext', `${value}% complete`);
            }
        });
    }

    setupColorContrast() {
        // High contrast mode detection
        if (window.matchMedia('(prefers-contrast: high)').matches) {
            document.body.classList.add('high-contrast');
        }

        // Reduced motion support
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            document.body.classList.add('reduced-motion');
        }
    }

    createSkipLinks() {
        if (document.querySelector('.skip-links')) return;

        const skipLinks = document.createElement('div');
        skipLinks.className = 'skip-links';
        skipLinks.innerHTML = `
            <a href="#main-content">Skip to main content</a>
            <a href="#navigation">Skip to navigation</a>
        `;
        document.body.insertBefore(skipLinks, document.body.firstChild);
    }

    createLiveRegion() {
        if (document.querySelector('#live-region')) return;

        const liveRegion = document.createElement('div');
        liveRegion.id = 'live-region';
        liveRegion.setAttribute('aria-live', 'polite');
        liveRegion.setAttribute('aria-atomic', 'true');
        liveRegion.style.cssText = 'position:absolute;left:-10000px;width:1px;height:1px;overflow:hidden;';
        document.body.appendChild(liveRegion);
    }

    announce(message) {
        const liveRegion = document.getElementById('live-region');
        if (liveRegion) {
            liveRegion.textContent = message;
            setTimeout(() => liveRegion.textContent = '', 1000);
        }
    }

    trapFocus(e, container) {
        const focusableElements = container.querySelectorAll(this.focusableElements);
        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (e.shiftKey && document.activeElement === firstElement) {
            e.preventDefault();
            lastElement.focus();
        } else if (!e.shiftKey && document.activeElement === lastElement) {
            e.preventDefault();
            firstElement.focus();
        }
    }

    closeTopModal() {
        const openModal = document.querySelector('.modal.show');
        if (openModal && window.app) {
            const modalId = openModal.id;
            window.app.closeModal(modalId);
        }
    }

    getIconAriaLabel(className) {
        const iconLabels = {
            'fa-plus': 'Add',
            'fa-edit': 'Edit',
            'fa-trash': 'Delete',
            'fa-eye': 'View',
            'fa-download': 'Download',
            'fa-upload': 'Upload',
            'fa-search': 'Search',
            'fa-close': 'Close',
            'fa-menu': 'Menu',
            'fa-user': 'User',
            'fa-settings': 'Settings'
        };

        for (const [iconClass, label] of Object.entries(iconLabels)) {
            if (className.includes(iconClass)) {
                return label;
            }
        }
        return null;
    }
}

// Initialize accessibility manager
document.addEventListener('DOMContentLoaded', () => {
    window.accessibilityManager = new AccessibilityManager();
});