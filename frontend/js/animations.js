/**
 * Enhanced Animation System for Hedera AgriFund
 * Advanced micro-interactions, particle effects, and futuristic animations
 */

class AnimationEngine {
    constructor() {
        this.observers = new Map();
        this.particleSystems = new Map();
        this.init();
    }

    init() {
        this.initMicroInteractions();
        this.initParticleEffects();
        this.initGlowEffects();
        this.initMorphingElements();
        this.initAdvancedScrollEffects();
        this.setupPerformanceOptimizations();
    }

    // Micro-interactions for buttons and cards
    initMicroInteractions() {
        // Button ripple effect
        const addRippleEffect = (button) => {
            button.addEventListener('click', (e) => {
                const rect = button.getBoundingClientRect();
                const size = Math.max(rect.width, rect.height);
                const x = e.clientX - rect.left - size / 2;
                const y = e.clientY - rect.top - size / 2;

                const ripple = document.createElement('div');
                ripple.className = 'ripple-effect';
                ripple.style.cssText = `
                    position: absolute;
                    width: ${size}px;
                    height: ${size}px;
                    left: ${x}px;
                    top: ${y}px;
                    background: rgba(255, 255, 255, 0.3);
                    border-radius: 50%;
                    pointer-events: none;
                    transform: scale(0);
                    animation: ripple 0.6s ease-out forwards;
                `;

                button.style.position = 'relative';
                button.style.overflow = 'hidden';
                button.appendChild(ripple);

                setTimeout(() => ripple.remove(), 600);
            });
        };

        // Apply to all buttons
        document.querySelectorAll('.btn').forEach(addRippleEffect);

        // Card hover animations with depth
        const cards = document.querySelectorAll('.value-prop-card, .pricing-card, .hero-card');
        cards.forEach(card => {
            let glowTimeout;

            card.addEventListener('mouseenter', () => {
                card.style.transition = 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
                card.style.transform = 'translateY(-12px) rotateX(5deg)';
                card.style.boxShadow = '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(59, 130, 246, 0.1)';

                // Add subtle glow
                clearTimeout(glowTimeout);
                this.addGlowEffect(card);
            });

            card.addEventListener('mouseleave', () => {
                card.style.transform = 'translateY(0) rotateX(0)';
                card.style.boxShadow = '';

                glowTimeout = setTimeout(() => {
                    this.removeGlowEffect(card);
                }, 300);
            });

            // Add magnetic effect for cards
            card.addEventListener('mousemove', (e) => {
                const rect = card.getBoundingClientRect();
                const x = e.clientX - rect.left - rect.width / 2;
                const y = e.clientY - rect.top - rect.height / 2;

                const rotateX = (y / rect.height) * 10;
                const rotateY = -(x / rect.width) * 10;

                card.style.transform = `translateY(-12px) rotateX(${5 + rotateX}deg) rotateY(${rotateY}deg)`;
            });
        });
    }

    // Advanced particle effects
    initParticleEffects() {
        // Floating particles for hero section
        const heroCanvas = document.getElementById('hero-canvas');
        if (heroCanvas) {
            this.createParticleSystem(heroCanvas, {
                particleCount: 50,
                particleSize: { min: 2, max: 4 },
                speed: { min: 0.5, max: 2 },
                color: 'rgba(59, 130, 246, 0.3)',
                connection: true,
                connectionDistance: 150
            });
        }

        // Success particles for form submission
        this.createSuccessParticles();
    }

    createParticleSystem(container, options) {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        canvas.style.position = 'absolute';
        canvas.style.top = '0';
        canvas.style.left = '0';
        canvas.style.pointerEvents = 'none';
        canvas.style.zIndex = '1';

        container.appendChild(canvas);

        const particles = [];

        const resizeCanvas = () => {
            canvas.width = container.offsetWidth;
            canvas.height = container.offsetHeight;
        };

        const createParticle = () => ({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            vx: (Math.random() - 0.5) * options.speed.max,
            vy: (Math.random() - 0.5) * options.speed.max,
            size: Math.random() * (options.particleSize.max - options.particleSize.min) + options.particleSize.min,
            opacity: Math.random() * 0.5 + 0.3
        });

        const animate = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // Update and draw particles
            particles.forEach((particle, index) => {
                particle.x += particle.vx;
                particle.y += particle.vy;

                // Wrap around edges
                if (particle.x < 0) particle.x = canvas.width;
                if (particle.x > canvas.width) particle.x = 0;
                if (particle.y < 0) particle.y = canvas.height;
                if (particle.y > canvas.height) particle.y = 0;

                // Draw particle
                ctx.beginPath();
                ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
                ctx.fillStyle = options.color.replace('0.3', particle.opacity);
                ctx.fill();

                // Draw connections
                if (options.connection) {
                    particles.slice(index + 1).forEach(otherParticle => {
                        const dx = particle.x - otherParticle.x;
                        const dy = particle.y - otherParticle.y;
                        const distance = Math.sqrt(dx * dx + dy * dy);

                        if (distance < options.connectionDistance) {
                            ctx.beginPath();
                            ctx.moveTo(particle.x, particle.y);
                            ctx.lineTo(otherParticle.x, otherParticle.y);
                            ctx.strokeStyle = options.color.replace('0.3', (1 - distance / options.connectionDistance) * 0.1);
                            ctx.stroke();
                        }
                    });
                }
            });

            if (!document.hidden && window.matchMedia('(prefers-reduced-motion: no-preference)').matches) {
                requestAnimationFrame(animate);
            }
        };

        // Initialize particles
        for (let i = 0; i < options.particleCount; i++) {
            particles.push(createParticle());
        }

        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);
        animate();

        // Store reference for cleanup
        this.particleSystems.set(container, { canvas, cleanup: () => {
            window.removeEventListener('resize', resizeCanvas);
            canvas.remove();
        }});
    }

    createSuccessParticles() {
        window.showSuccessParticles = (element) => {
            const rect = element.getBoundingClientRect();
            const centerX = rect.left + rect.width / 2;
            const centerY = rect.top + rect.height / 2;

            for (let i = 0; i < 15; i++) {
                const particle = document.createElement('div');
                particle.className = 'success-particle';
                particle.style.cssText = `
                    position: fixed;
                    width: 8px;
                    height: 8px;
                    background: #22c55e;
                    border-radius: 50%;
                    pointer-events: none;
                    z-index: 9999;
                    left: ${centerX}px;
                    top: ${centerY}px;
                `;

                document.body.appendChild(particle);

                const angle = (Math.PI * 2 * i) / 15;
                const velocity = 100 + Math.random() * 50;
                const vx = Math.cos(angle) * velocity;
                const vy = Math.sin(angle) * velocity;

                particle.animate([
                    {
                        transform: 'translate(0, 0) scale(1)',
                        opacity: 1
                    },
                    {
                        transform: `translate(${vx}px, ${vy}px) scale(0)`,
                        opacity: 0
                    }
                ], {
                    duration: 1000,
                    easing: 'cubic-bezier(0.4, 0, 0.2, 1)'
                }).onfinish = () => particle.remove();
            }
        };
    }

    // Glow effects for interactive elements
    initGlowEffects() {
        const style = document.createElement('style');
        style.textContent = `
            .glow-effect {
                position: relative;
                overflow: visible !important;
            }
            
            .glow-effect::before {
                content: '';
                position: absolute;
                top: -2px;
                left: -2px;
                right: -2px;
                bottom: -2px;
                background: linear-gradient(45deg, 
                    var(--color-primary-500), 
                    var(--color-secondary-500), 
                    var(--color-accent-500));
                border-radius: inherit;
                filter: blur(8px);
                opacity: 0;
                z-index: -1;
                transition: opacity 0.3s ease;
            }
            
            .glow-effect.active::before {
                opacity: 0.3;
                animation: glow-pulse 2s ease-in-out infinite alternate;
            }
            
            @keyframes glow-pulse {
                from { filter: blur(8px) brightness(1); }
                to { filter: blur(12px) brightness(1.2); }
            }
            
            .ripple-effect {
                animation: ripple 0.6s ease-out forwards;
            }
            
            @keyframes ripple {
                to {
                    transform: scale(2);
                    opacity: 0;
                }
            }
            
            .success-particle {
                animation: success-burst 1s ease-out forwards;
            }
            
            @keyframes success-burst {
                0% {
                    transform: scale(0);
                    opacity: 1;
                }
                50% {
                    transform: scale(1);
                }
                100% {
                    transform: scale(0);
                    opacity: 0;
                }
            }
        `;
        document.head.appendChild(style);
    }

    addGlowEffect(element) {
        element.classList.add('glow-effect', 'active');
    }

    removeGlowEffect(element) {
        element.classList.remove('active');
    }

    // Morphing text and number animations
    initMorphingElements() {
        // Animated number counting with easing
        window.animateValue = (element, start, end, duration, suffix = '') => {
            const startTime = performance.now();

            const animate = (currentTime) => {
                const elapsed = currentTime - startTime;
                const progress = Math.min(elapsed / duration, 1);

                // Easing function (ease-out-cubic)
                const easeProgress = 1 - Math.pow(1 - progress, 3);

                const current = start + (end - start) * easeProgress;
                element.textContent = Math.floor(current) + suffix;

                if (progress < 1) {
                    requestAnimationFrame(animate);
                }
            };

            requestAnimationFrame(animate);
        };

        // Typewriter effect for hero title
        const heroTitle = document.querySelector('.hero-title');
        if (heroTitle) {
            this.typewriterEffect(heroTitle);
        }
    }

    typewriterEffect(element) {
        const originalText = element.textContent;
        const lines = originalText.split('\n').filter(line => line.trim());

        element.innerHTML = '';

        let lineIndex = 0;
        let charIndex = 0;

        const typeNextChar = () => {
            if (lineIndex < lines.length) {
                const currentLine = lines[lineIndex];

                if (charIndex < currentLine.length) {
                    if (charIndex === 0) {
                        const span = document.createElement('span');
                        span.className = lineIndex === 0 ? 'title-main' :
                                      lineIndex === 1 ? 'title-accent' : 'title-powered';
                        element.appendChild(span);
                    }

                    const currentSpan = element.lastElementChild;
                    currentSpan.textContent += currentLine[charIndex];
                    charIndex++;

                    setTimeout(typeNextChar, 50);
                } else {
                    lineIndex++;
                    charIndex = 0;
                    setTimeout(typeNextChar, 200);
                }
            }
        };

        // Start typing after a small delay
        setTimeout(typeNextChar, 1000);
    }

    // Advanced scroll effects
    initAdvancedScrollEffects() {
        // Parallax layers
        const parallaxElements = document.querySelectorAll('[data-parallax]');

        const updateParallax = () => {
            const scrolled = window.pageYOffset;

            parallaxElements.forEach(element => {
                const rate = element.dataset.parallax || 0.5;
                const yPos = -(scrolled * rate);
                element.style.transform = `translate3d(0, ${yPos}px, 0)`;
            });
        };

        if (parallaxElements.length > 0) {
            window.addEventListener('scroll', this.throttle(updateParallax, 16));
        }

        // Reveal animations with stagger
        const revealElements = document.querySelectorAll('.value-prop-card, .timeline-step, .pricing-card');

        if ('IntersectionObserver' in window) {
            const revealObserver = new IntersectionObserver((entries) => {
                entries.forEach((entry, index) => {
                    if (entry.isIntersecting) {
                        setTimeout(() => {
                            entry.target.style.opacity = '1';
                            entry.target.style.transform = 'translateY(0)';
                        }, index * 100);
                        revealObserver.unobserve(entry.target);
                    }
                });
            }, { threshold: 0.1 });

            revealElements.forEach(element => {
                element.style.opacity = '0';
                element.style.transform = 'translateY(30px)';
                element.style.transition = 'opacity 0.8s ease, transform 0.8s ease';
                revealObserver.observe(element);
            });
        }
    }

    // Performance optimizations
    setupPerformanceOptimizations() {
        // Disable animations on low-end devices
        const isLowEnd = navigator.hardwareConcurrency <= 2 ||
                        navigator.deviceMemory <= 4 ||
                        window.matchMedia('(prefers-reduced-motion: reduce)').matches;

        if (isLowEnd) {
            document.documentElement.style.setProperty('--transition-fast', '0ms');
            document.documentElement.style.setProperty('--transition-base', '0ms');
            document.documentElement.style.setProperty('--transition-slow', '0ms');
        }

        // Pause animations when tab is not visible
        document.addEventListener('visibilitychange', () => {
            const animatedElements = document.querySelectorAll('[style*="animation"]');
            animatedElements.forEach(element => {
                if (document.hidden) {
                    element.style.animationPlayState = 'paused';
                } else {
                    element.style.animationPlayState = 'running';
                }
            });
        });

        // GPU acceleration for smooth animations
        const acceleratedElements = document.querySelectorAll('.btn, .value-prop-card, .hero-card');
        acceleratedElements.forEach(element => {
            element.style.willChange = 'transform';
            element.style.transform = 'translateZ(0)'; // Force GPU layer
        });
    }

    // Utility function for throttling
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

    // Cleanup method
    destroy() {
        this.observers.forEach(observer => observer.disconnect());
        this.particleSystems.forEach(system => system.cleanup());
        this.observers.clear();
        this.particleSystems.clear();
    }
}

// Initialize animation engine when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.animationEngine = new AnimationEngine();
});

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
    if (window.animationEngine) {
        window.animationEngine.destroy();
    }
});

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AnimationEngine;
}
