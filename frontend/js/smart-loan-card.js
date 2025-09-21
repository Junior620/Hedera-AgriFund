/* Smart Loan Card - JavaScript Controller */

/**
 * Smart Loan Card Component Controller
 * Handles animations, interactions, and state management
 */
class SmartLoanCard {
    constructor(cardSelector = '.smart-loan-card') {
        this.card = document.querySelector(cardSelector);
        this.progressFill = document.getElementById('smartLoanProgressFill');
        this.metricTiles = this.card?.querySelectorAll('.metric-tile');
        this.progressPercentage = this.card?.querySelector('.progress-percentage');

        this.isLoaded = false;
        this.animationDelay = 100;

        if (this.card) {
            this.init();
        }
    }

    /**
     * Initialize the card component
     */
    init() {
        this.setupAccessibility();
        this.setupAnimations();
        this.startEntranceAnimation();
    }

    /**
     * Setup accessibility features
     */
    setupAccessibility() {
        if (!this.metricTiles) return;

        this.metricTiles.forEach((tile, index) => {
            // Enhanced keyboard navigation
            tile.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    this.triggerTileAnimation(tile);
                }

                // Arrow key navigation
                if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
                    e.preventDefault();
                    this.focusNextTile(index);
                } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
                    e.preventDefault();
                    this.focusPrevTile(index);
                }
            });

            // Enhanced hover effects
            tile.addEventListener('mouseenter', () => {
                if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
                    this.triggerTileHover(tile);
                }
            });

            tile.addEventListener('mouseleave', () => {
                this.resetTileHover(tile);
            });
        });
    }

    /**
     * Setup entrance animations
     */
    setupAnimations() {
        // Respect user's motion preferences
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            this.animationDelay = 0;
            return;
        }

        // Setup Intersection Observer for scroll-triggered animations
        if ('IntersectionObserver' in window) {
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting && !this.isLoaded) {
                        this.startEntranceAnimation();
                    }
                });
            }, {
                threshold: 0.1,
                rootMargin: '50px'
            });

            observer.observe(this.card);
        }
    }

    /**
     * Start the entrance animation sequence
     */
    startEntranceAnimation() {
        if (this.isLoaded) return;

        // Animate card entrance
        setTimeout(() => {
            this.card.classList.add('loaded');
            this.isLoaded = true;
        }, this.animationDelay);

        // Animate progress bar
        setTimeout(() => {
            this.animateProgressBar(85);
        }, this.animationDelay + 300);

        // Stagger metric tile animations
        if (this.metricTiles) {
            this.metricTiles.forEach((tile, index) => {
                setTimeout(() => {
                    tile.style.opacity = '1';
                    tile.style.transform = 'translateY(0)';
                }, this.animationDelay + 150 + (index * 100));
            });
        }
    }

    /**
     * Animate the progress bar to a specific percentage
     */
    animateProgressBar(targetPercentage) {
        if (!this.progressFill) return;

        let currentPercentage = 0;
        const increment = targetPercentage / 50; // 50 steps for smooth animation
        const duration = 800; // Total animation duration
        const stepDuration = duration / 50;

        const animate = () => {
            currentPercentage += increment;

            if (currentPercentage <= targetPercentage) {
                this.progressFill.style.width = `${currentPercentage}%`;

                // Update percentage text with easing
                if (this.progressPercentage) {
                    const displayPercentage = Math.round(currentPercentage);
                    this.progressPercentage.textContent = `${displayPercentage}% Funded`;
                }

                setTimeout(animate, stepDuration);
            } else {
                // Ensure final values are set
                this.progressFill.style.width = `${targetPercentage}%`;
                if (this.progressPercentage) {
                    this.progressPercentage.textContent = `${targetPercentage}% Funded`;
                }
            }
        };

        animate();
    }

    /**
     * Trigger tile click/tap animation
     */
    triggerTileAnimation(tile) {
        tile.style.transform = 'translateY(-1px) scale(0.98)';

        setTimeout(() => {
            tile.style.transform = 'translateY(-1px) scale(1.01)';
        }, 150);

        setTimeout(() => {
            tile.style.transform = '';
        }, 300);

        // Add ripple effect for APR highlight tile
        if (tile.classList.contains('apr-highlight')) {
            this.createRippleEffect(tile);
        }
    }

    /**
     * Trigger tile hover animation
     */
    triggerTileHover(tile) {
        tile.style.transform = 'translateY(-2px) scale(1.02)';
        tile.style.boxShadow = '0 8px 32px rgba(0, 0, 0, 0.12)';
    }

    /**
     * Reset tile hover animation
     */
    resetTileHover(tile) {
        tile.style.transform = '';
        tile.style.boxShadow = '';
    }

    /**
     * Create ripple effect for special interactions
     */
    createRippleEffect(tile) {
        const ripple = document.createElement('div');
        ripple.style.cssText = `
            position: absolute;
            top: 50%;
            left: 50%;
            width: 20px;
            height: 20px;
            background: radial-gradient(circle, rgba(16, 185, 129, 0.4) 0%, transparent 70%);
            border-radius: 50%;
            transform: translate(-50%, -50%) scale(0);
            animation: rippleEffect 0.6s ease-out;
            pointer-events: none;
            z-index: 1;
        `;

        // Add ripple animation keyframes if not already added
        if (!document.querySelector('#rippleKeyframes')) {
            const style = document.createElement('style');
            style.id = 'rippleKeyframes';
            style.textContent = `
                @keyframes rippleEffect {
                    0% {
                        transform: translate(-50%, -50%) scale(0);
                        opacity: 1;
                    }
                    100% {
                        transform: translate(-50%, -50%) scale(4);
                        opacity: 0;
                    }
                }
            `;
            document.head.appendChild(style);
        }

        tile.style.position = 'relative';
        tile.appendChild(ripple);

        setTimeout(() => {
            ripple.remove();
        }, 600);
    }

    /**
     * Focus management for keyboard navigation
     */
    focusNextTile(currentIndex) {
        if (!this.metricTiles) return;

        const nextIndex = (currentIndex + 1) % this.metricTiles.length;
        this.metricTiles[nextIndex].focus();
    }

    focusPrevTile(currentIndex) {
        if (!this.metricTiles) return;

        const prevIndex = currentIndex === 0 ? this.metricTiles.length - 1 : currentIndex - 1;
        this.metricTiles[prevIndex].focus();
    }

    /**
     * Update card data dynamically
     */
    updateData(data) {
        if (!this.card) return;

        const {
            title = 'Smart Loan Request',
            subtitle = 'Coffee Farmer, Kenya',
            requested = '$5,000',
            collateral = '2,500kg Coffee',
            apr = '8.5%',
            progress = 85
        } = data;

        // Update text content
        const titleEl = this.card.querySelector('.card-title');
        const subtitleEl = this.card.querySelector('.card-subtitle');
        const requestedEl = this.card.querySelector('.metric-tile:nth-child(1) .metric-value');
        const collateralEl = this.card.querySelector('.metric-tile:nth-child(2) .metric-value');
        const aprEl = this.card.querySelector('.apr-highlight .metric-value');

        if (titleEl) titleEl.textContent = title;
        if (subtitleEl) subtitleEl.textContent = subtitle;
        if (requestedEl) requestedEl.textContent = requested;
        if (collateralEl) collateralEl.textContent = collateral;
        if (aprEl) aprEl.textContent = apr;

        // Animate progress bar to new value
        this.animateProgressBar(progress);
    }

    /**
     * Show loading state
     */
    showLoading() {
        if (!this.card) return;

        this.card.classList.add('loading');

        // Update aria-live region
        const progressPercentage = this.card.querySelector('.progress-percentage');
        if (progressPercentage) {
            progressPercentage.textContent = 'Loading...';
        }
    }

    /**
     * Hide loading state
     */
    hideLoading() {
        if (!this.card) return;

        this.card.classList.remove('loading');
    }

    /**
     * Show error state
     */
    showError(errorMessage = 'Rate unavailable') {
        if (!this.card) return;

        this.card.classList.add('error');

        const aprTile = this.card.querySelector('.apr-highlight');
        const aprValue = aprTile?.querySelector('.metric-value');

        if (aprValue) {
            aprValue.textContent = 'N/A';
        }

        // Add error message if not exists
        let errorEl = aprTile?.querySelector('.error-message');
        if (!errorEl && aprTile) {
            errorEl = document.createElement('div');
            errorEl.className = 'error-message';
            errorEl.innerHTML = `⚠️ ${errorMessage}`;
            aprTile.appendChild(errorEl);
        }
    }

    /**
     * Hide error state
     */
    hideError() {
        if (!this.card) return;

        this.card.classList.remove('error');

        const errorMessage = this.card.querySelector('.error-message');
        if (errorMessage) {
            errorMessage.remove();
        }
    }

    /**
     * Destroy the card instance and cleanup
     */
    destroy() {
        if (this.card) {
            this.card.classList.remove('loaded');
            this.card = null;
            this.progressFill = null;
            this.metricTiles = null;
            this.progressPercentage = null;
        }
    }
}

/**
 * Auto-initialize when DOM is ready
 */
document.addEventListener('DOMContentLoaded', function() {
    // Initialize Smart Loan Card
    window.smartLoanCard = new SmartLoanCard('.smart-loan-card');

    // Demo functions for testing (remove in production)
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        // Demo: Update data after 3 seconds
        setTimeout(() => {
            if (window.smartLoanCard) {
                window.smartLoanCard.updateData({
                    title: 'Updated Loan Request',
                    subtitle: 'Rice Farmer, Vietnam',
                    requested: '$7,500',
                    collateral: '3,000kg Rice',
                    apr: '7.2%',
                    progress: 92
                });
            }
        }, 3000);

        // Demo: Show loading state after 6 seconds
        setTimeout(() => {
            if (window.smartLoanCard) {
                window.smartLoanCard.showLoading();
            }
        }, 6000);

        // Demo: Hide loading and show error after 8 seconds
        setTimeout(() => {
            if (window.smartLoanCard) {
                window.smartLoanCard.hideLoading();
                window.smartLoanCard.showError('Rate calculation failed');
            }
        }, 8000);

        // Demo: Reset to normal after 10 seconds
        setTimeout(() => {
            if (window.smartLoanCard) {
                window.smartLoanCard.hideError();
                window.smartLoanCard.updateData({
                    title: 'Smart Loan Request',
                    subtitle: 'Coffee Farmer, Kenya',
                    requested: '$5,000',
                    collateral: '2,500kg Coffee',
                    apr: '8.5%',
                    progress: 85
                });
            }
        }, 10000);
    }
});

/**
 * Export for module usage
 */
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SmartLoanCard;
}

/**
 * Performance monitoring
 */
if ('PerformanceObserver' in window) {
    const observer = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry) => {
            if (entry.name.includes('smart-loan-card')) {
                console.log(`Smart Loan Card ${entry.entryType}:`, entry.duration + 'ms');
            }
        });
    });

    try {
        observer.observe({ entryTypes: ['measure', 'navigation'] });
    } catch (e) {
        // Fallback for older browsers
        console.log('Performance monitoring not available');
    }
}
