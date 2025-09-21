// Performance Optimizer - Lazy Loading & Compression
class PerformanceOptimizer {
    constructor() {
        this.imageObserver = null;
        this.componentObserver = null;
        this.init();
    }

    init() {
        this.setupLazyLoading();
        this.setupImageOptimization();
        this.setupCodeSplitting();
        this.preloadCriticalResources();
    }

    setupLazyLoading() {
        // Lazy load images
        this.imageObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src;
                    img.classList.remove('lazy');
                    this.imageObserver.unobserve(img);
                }
            });
        }, { rootMargin: '50px' });

        document.querySelectorAll('img[data-src]').forEach(img => {
            this.imageObserver.observe(img);
        });

        // Lazy load components
        this.componentObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const component = entry.target;
                    this.loadComponent(component);
                    this.componentObserver.unobserve(component);
                }
            });
        });
    }

    setupImageOptimization() {
        // Convert images to WebP if supported
        const supportsWebP = this.checkWebPSupport();
        if (supportsWebP) {
            document.querySelectorAll('img').forEach(img => {
                if (img.src && !img.src.includes('.webp')) {
                    const webpSrc = img.src.replace(/\.(jpg|jpeg|png)$/i, '.webp');
                    img.src = webpSrc;
                }
            });
        }
    }

    checkWebPSupport() {
        const canvas = document.createElement('canvas');
        canvas.width = 1;
        canvas.height = 1;
        return canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;
    }

    setupCodeSplitting() {
        // Dynamic imports for heavy components
        window.loadChart = async () => {
            try {
                const module = await import('./chart-component.js');
                return new module.ChartComponent();
            } catch (error) {
                console.warn('Chart component not available:', error);
                return null;
            }
        };

        window.loadAnalytics = async () => {
            try {
                const { Analytics } = await import('./analytics-component.js');
                return new Analytics();
            } catch (error) {
                console.warn('Analytics component not available:', error);
                return null;
            }
        };
    }

    preloadCriticalResources() {
        const criticalResources = [
            '/styles/modern-ui.css',
            '/js/app.js',
            '/assets/icons/icon-192x192.png'
        ];

        criticalResources.forEach(resource => {
            const link = document.createElement('link');
            link.rel = 'preload';
            link.href = resource;
            link.as = resource.endsWith('.css') ? 'style' : 
                     resource.endsWith('.js') ? 'script' : 'image';
            document.head.appendChild(link);
        });
    }

    async loadComponent(element) {
        const componentName = element.dataset.component;
        if (!componentName) return;
        
        try {
            const module = await import(`./components/${componentName}.js`);
            const Component = module.default || module[componentName];
            if (Component) {
                new Component(element);
            }
        } catch (error) {
            console.warn(`Failed to load component: ${componentName}`, error);
        }
    }
}

// Initialize performance optimizer
document.addEventListener('DOMContentLoaded', () => {
    window.performanceOptimizer = new PerformanceOptimizer();
});