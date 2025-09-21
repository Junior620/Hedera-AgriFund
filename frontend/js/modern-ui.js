/**
 * Hedera AgriFund - Modern UI JavaScript
 * Futuristic, trustworthy UI/UX interactions and animations
 */

class ModernUI {
    constructor() {
        this.init();
        this.setupEventListeners();
        this.initializeAnimations();
    }

    init() {
        // Initialize navbar scroll effect
        this.initNavbarScroll();

        // Initialize metrics counter animation
        this.initMetricsCounter();

        // Initialize carousel
        this.initCarousel();

        // Initialize FAQ accordion
        this.initFAQ();

        // Initialize theme toggle
        this.initThemeToggle();

        // Initialize mobile menu
        this.initMobileMenu();

        // Initialize form enhancements
        this.initForms();

        // Initialize scroll animations
        this.initScrollAnimations();
    }

    setupEventListeners() {
        // Handle window resize
        window.addEventListener('resize', this.debounce(() => {
            this.handleResize();
        }, 250));

        // Handle scroll events
        window.addEventListener('scroll', this.throttle(() => {
            this.handleScroll();
        }, 16)); // 60fps
    }

    initializeAnimations() {
        // Initialize AOS (Animate On Scroll) if available
        if (typeof AOS !== 'undefined') {
            AOS.init({
                duration: 800,
                easing: 'ease-out-cubic',
                once: true,
                offset: 100,
                disable: window.matchMedia('(prefers-reduced-motion: reduce)').matches
            });
        }
    }

    // Navbar scroll effect
    initNavbarScroll() {
        const navbar = document.getElementById('navbar');
        if (!navbar) return;

        const handleNavbarScroll = () => {
            if (window.scrollY > 50) {
                navbar.classList.add('scrolled');
            } else {
                navbar.classList.remove('scrolled');
            }
        };

        window.addEventListener('scroll', this.throttle(handleNavbarScroll, 16));
    }

    // Animated counters for metrics
    initMetricsCounter() {
        const counters = document.querySelectorAll('.metric-number[data-count]');

        const animateCounter = (element) => {
            const target = parseFloat(element.dataset.count);
            const prefix = element.dataset.prefix || '';
            const suffix = element.dataset.suffix || '';
            const duration = 2000; // 2 seconds
            const step = target / (duration / 16); // 60fps

            let current = 0;
            const timer = setInterval(() => {
                current += step;
                if (current >= target) {
                    current = target;
                    clearInterval(timer);
                }

                let displayValue = Math.floor(current * 10) / 10; // 1 decimal place
                if (target >= 1000) {
                    displayValue = Math.floor(current);
                }

                element.textContent = `${prefix}${displayValue}${suffix}`;
            }, 16);
        };

        // Use Intersection Observer for triggering animations
        if ('IntersectionObserver' in window) {
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        animateCounter(entry.target);
                        observer.unobserve(entry.target);
                    }
                });
            }, { threshold: 0.5 });

            counters.forEach(counter => observer.observe(counter));
        }
    }

    // Carousel functionality
    initCarousel() {
        const track = document.getElementById('caseStudiesTrack');
        const dots = document.querySelectorAll('.dot');

        if (!track || dots.length === 0) return;

        let currentSlide = 0;
        const totalSlides = dots.length;

        const updateCarousel = () => {
            const translateX = -currentSlide * 100;
            track.style.transform = `translateX(${translateX}%)`;

            // Update dots
            dots.forEach((dot, index) => {
                dot.classList.toggle('active', index === currentSlide);
            });
        };

        // Auto-advance carousel
        const autoAdvance = setInterval(() => {
            currentSlide = (currentSlide + 1) % totalSlides;
            updateCarousel();
        }, 8000); // 8 seconds per slide

        // Manual controls
        window.nextSlide = () => {
            clearInterval(autoAdvance);
            currentSlide = (currentSlide + 1) % totalSlides;
            updateCarousel();
        };

        window.prevSlide = () => {
            clearInterval(autoAdvance);
            currentSlide = (currentSlide - 1 + totalSlides) % totalSlides;
            updateCarousel();
        };

        window.currentSlide = (index) => {
            clearInterval(autoAdvance);
            currentSlide = index;
            updateCarousel();
        };

        // Touch/swipe support for mobile
        this.addSwipeSupport(track, () => window.nextSlide(), () => window.prevSlide());
    }

    // FAQ accordion
    initFAQ() {
        window.toggleFAQ = (button) => {
            const faqItem = button.closest('.faq-item');
            const isActive = faqItem.classList.contains('active');

            // Close all other FAQ items
            document.querySelectorAll('.faq-item').forEach(item => {
                item.classList.remove('active');
            });

            // Toggle current item
            if (!isActive) {
                faqItem.classList.add('active');
            }
        };
    }

    // Theme toggle functionality
    initThemeToggle() {
        const savedTheme = localStorage.getItem('theme') || 'light';
        document.body.className = `${savedTheme}-theme`;

        window.toggleTheme = () => {
            const currentTheme = document.body.classList.contains('dark-theme') ? 'dark' : 'light';
            const newTheme = currentTheme === 'dark' ? 'light' : 'dark';

            document.body.className = `${newTheme}-theme`;
            localStorage.setItem('theme', newTheme);

            // Update theme toggle icon
            const themeToggle = document.querySelector('.theme-toggle i');
            if (themeToggle) {
                themeToggle.className = newTheme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
            }
        };
    }

    // Mobile menu functionality
    initMobileMenu() {
        window.toggleMobileMenu = () => {
            const navMenu = document.getElementById('navMenu');
            const menuToggle = document.querySelector('.mobile-menu-toggle');

            if (navMenu && menuToggle) {
                navMenu.classList.toggle('active');
                menuToggle.classList.toggle('active');
            }
        };

        // Close mobile menu when clicking outside
        document.addEventListener('click', (e) => {
            const navMenu = document.getElementById('navMenu');
            const menuToggle = document.querySelector('.mobile-menu-toggle');

            if (navMenu && navMenu.classList.contains('active') &&
                !navMenu.contains(e.target) &&
                !menuToggle.contains(e.target)) {
                navMenu.classList.remove('active');
                menuToggle.classList.remove('active');
            }
        });
    }

    // Enhanced form functionality
    initForms() {
        const demoForm = document.getElementById('demoForm');
        if (!demoForm) return;

        demoForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const formData = new FormData(demoForm);
            const submitBtn = demoForm.querySelector('button[type="submit"]');
            const originalText = submitBtn.innerHTML;

            // Show loading state
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> <span>Submitting...</span>';
            submitBtn.disabled = true;

            try {
                // Simulate API call
                await this.delay(2000);

                // Show success state
                submitBtn.innerHTML = '<i class="fas fa-check"></i> <span>Request Sent!</span>';
                submitBtn.classList.add('btn-success');

                // Reset form
                setTimeout(() => {
                    demoForm.reset();
                    submitBtn.innerHTML = originalText;
                    submitBtn.disabled = false;
                    submitBtn.classList.remove('btn-success');
                }, 3000);

            } catch (error) {
                // Show error state
                submitBtn.innerHTML = '<i class="fas fa-exclamation-triangle"></i> <span>Error occurred</span>';
                submitBtn.classList.add('btn-error');

                setTimeout(() => {
                    submitBtn.innerHTML = originalText;
                    submitBtn.disabled = false;
                    submitBtn.classList.remove('btn-error');
                }, 3000);
            }
        });

        // Add floating label effect
        const inputs = demoForm.querySelectorAll('input, textarea, select');
        inputs.forEach(input => {
            input.addEventListener('focus', (e) => {
                e.target.parentElement.classList.add('focused');
            });

            input.addEventListener('blur', (e) => {
                if (!e.target.value) {
                    e.target.parentElement.classList.remove('focused');
                }
            });
        });
    }

    // Scroll-based animations
    initScrollAnimations() {
        // Parallax effect for hero section
        const heroBackground = document.querySelector('.hero-background');
        if (heroBackground) {
            window.addEventListener('scroll', this.throttle(() => {
                const scrolled = window.pageYOffset;
                const rate = scrolled * -0.5;
                heroBackground.style.transform = `translateY(${rate}px)`;
            }, 16));
        }

        // Reveal animations for sections
        const sections = document.querySelectorAll('section:not(.hero)');
        if ('IntersectionObserver' in window) {
            const sectionObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('section-visible');
                    }
                });
            }, { threshold: 0.1 });

            sections.forEach(section => {
                section.classList.add('section-hidden');
                sectionObserver.observe(section);
            });
        }
    }

    // Touch/swipe support
    addSwipeSupport(element, onSwipeLeft, onSwipeRight) {
        let startX = 0;
        let startY = 0;

        element.addEventListener('touchstart', (e) => {
            startX = e.touches[0].clientX;
            startY = e.touches[0].clientY;
        }, { passive: true });

        element.addEventListener('touchend', (e) => {
            const endX = e.changedTouches[0].clientX;
            const endY = e.changedTouches[0].clientY;

            const deltaX = endX - startX;
            const deltaY = endY - startY;

            // Only trigger if horizontal swipe is dominant
            if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 50) {
                if (deltaX > 0 && onSwipeRight) {
                    onSwipeRight();
                } else if (deltaX < 0 && onSwipeLeft) {
                    onSwipeLeft();
                }
            }
        }, { passive: true });
    }

    // Event handling utilities
    handleResize() {
        // Handle responsive behaviors
        const isMobile = window.innerWidth < 1024;
        document.body.classList.toggle('mobile-view', isMobile);
    }

    handleScroll() {
        // Update navbar and other scroll-dependent elements
        const scrollProgress = Math.min(window.scrollY / (document.body.scrollHeight - window.innerHeight), 1);
        document.documentElement.style.setProperty('--scroll-progress', scrollProgress);
    }

    // Utility functions
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

    debounce(func, wait) {
        let timeout;
        return function() {
            const context = this;
            const args = arguments;
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(context, args), wait);
        };
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// Global functions for button interactions
window.openFarmerOnboarding = () => {
    console.log('Opening farmer onboarding...');
    // Implement farmer onboarding modal or redirect
};

window.openLenderOnboarding = () => {
    console.log('Opening lender onboarding...');
    // Implement lender onboarding modal or redirect
};

window.launchApp = () => {
    console.log('Launching application...');
    // Implement app launch logic
};

window.startJourney = () => {
    console.log('Starting user journey...');
    // Implement journey start logic
};

window.watchDemo = () => {
    console.log('Opening demo video...');
    // Implement demo modal or video player
};

// Initialize the Modern UI system when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.modernUI = new ModernUI();
});

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ModernUI;
}
