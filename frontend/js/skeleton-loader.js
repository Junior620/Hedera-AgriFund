// Skeleton Loading Components
class SkeletonLoader {
    constructor() {
        this.setupStyles();
    }

    setupStyles() {
        if (document.getElementById('skeleton-styles')) return;

        const styles = document.createElement('style');
        styles.id = 'skeleton-styles';
        styles.textContent = `
            .skeleton {
                background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
                background-size: 200% 100%;
                animation: skeleton-loading 1.5s infinite;
                border-radius: 4px;
            }
            
            @keyframes skeleton-loading {
                0% { background-position: 200% 0; }
                100% { background-position: -200% 0; }
            }
            
            .skeleton-card {
                background: white;
                border-radius: 12px;
                padding: 20px;
                margin-bottom: 16px;
                box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            }
            
            .skeleton-header {
                display: flex;
                align-items: center;
                gap: 12px;
                margin-bottom: 16px;
            }
            
            .skeleton-avatar {
                width: 48px;
                height: 48px;
                border-radius: 50%;
            }
            
            .skeleton-text {
                height: 16px;
                margin-bottom: 8px;
            }
            
            .skeleton-text.title {
                height: 20px;
                width: 60%;
            }
            
            .skeleton-text.subtitle {
                height: 14px;
                width: 40%;
            }
            
            .skeleton-text.short {
                width: 30%;
            }
            
            .skeleton-text.medium {
                width: 60%;
            }
            
            .skeleton-text.long {
                width: 80%;
            }
            
            .skeleton-button {
                height: 36px;
                width: 100px;
                border-radius: 8px;
            }
            
            .skeleton-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
                gap: 20px;
            }
            
            .dark-theme .skeleton {
                background: linear-gradient(90deg, #374151 25%, #4b5563 50%, #374151 75%);
                background-size: 200% 100%;
            }
            
            .dark-theme .skeleton-card {
                background: #1f2937;
            }
        `;
        document.head.appendChild(styles);
    }

    createLoanCardSkeleton() {
        return `
            <div class="skeleton-card">
                <div class="skeleton-header">
                    <div class="skeleton skeleton-avatar"></div>
                    <div style="flex: 1;">
                        <div class="skeleton skeleton-text title"></div>
                        <div class="skeleton skeleton-text subtitle"></div>
                    </div>
                    <div class="skeleton skeleton-button"></div>
                </div>
                <div class="skeleton-body">
                    <div class="skeleton skeleton-text medium"></div>
                    <div class="skeleton skeleton-text short"></div>
                    <div class="skeleton skeleton-text long"></div>
                </div>
                <div style="margin-top: 16px; display: flex; gap: 12px;">
                    <div class="skeleton skeleton-button"></div>
                    <div class="skeleton skeleton-button"></div>
                </div>
            </div>
        `;
    }

    createTokenCardSkeleton() {
        return `
            <div class="skeleton-card">
                <div class="skeleton-header">
                    <div class="skeleton skeleton-avatar"></div>
                    <div style="flex: 1;">
                        <div class="skeleton skeleton-text title"></div>
                        <div class="skeleton skeleton-text subtitle"></div>
                    </div>
                </div>
                <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin: 16px 0;">
                    <div>
                        <div class="skeleton skeleton-text short"></div>
                        <div class="skeleton skeleton-text medium"></div>
                    </div>
                    <div>
                        <div class="skeleton skeleton-text short"></div>
                        <div class="skeleton skeleton-text medium"></div>
                    </div>
                    <div>
                        <div class="skeleton skeleton-text short"></div>
                        <div class="skeleton skeleton-text medium"></div>
                    </div>
                </div>
                <div class="skeleton skeleton-button" style="width: 100%; margin-top: 16px;"></div>
            </div>
        `;
    }

    createDashboardSkeleton() {
        return `
            <div class="skeleton-grid">
                <div class="skeleton-card">
                    <div class="skeleton skeleton-text title"></div>
                    <div class="skeleton skeleton-text" style="height: 32px; width: 50%; margin: 16px 0;"></div>
                    <div class="skeleton skeleton-text medium"></div>
                </div>
                <div class="skeleton-card">
                    <div class="skeleton skeleton-text title"></div>
                    <div class="skeleton skeleton-text" style="height: 32px; width: 50%; margin: 16px 0;"></div>
                    <div class="skeleton skeleton-text medium"></div>
                </div>
                <div class="skeleton-card">
                    <div class="skeleton skeleton-text title"></div>
                    <div class="skeleton skeleton-text" style="height: 32px; width: 50%; margin: 16px 0;"></div>
                    <div class="skeleton skeleton-text medium"></div>
                </div>
            </div>
        `;
    }

    showLoading(container, type = 'card', count = 3) {
        if (!container) return;

        const skeletons = [];
        for (let i = 0; i < count; i++) {
            switch (type) {
                case 'loan':
                    skeletons.push(this.createLoanCardSkeleton());
                    break;
                case 'token':
                    skeletons.push(this.createTokenCardSkeleton());
                    break;
                case 'dashboard':
                    skeletons.push(this.createDashboardSkeleton());
                    break;
                default:
                    skeletons.push(this.createLoanCardSkeleton());
            }
        }

        container.innerHTML = skeletons.join('');
        container.classList.add('skeleton-loading');
    }

    hideLoading(container) {
        if (!container) return;
        container.classList.remove('skeleton-loading');
    }

    // Utility method to wrap async operations with skeleton loading
    async withSkeleton(container, asyncOperation, skeletonType = 'card', count = 3) {
        this.showLoading(container, skeletonType, count);
        
        try {
            const result = await asyncOperation();
            this.hideLoading(container);
            return result;
        } catch (error) {
            this.hideLoading(container);
            throw error;
        }
    }
}

// Initialize skeleton loader
document.addEventListener('DOMContentLoaded', () => {
    window.skeletonLoader = new SkeletonLoader();
});