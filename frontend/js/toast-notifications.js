// Advanced Toast Notification System
class ToastManager {
    constructor() {
        this.container = null;
        this.toasts = new Map();
        this.init();
    }

    init() {
        this.createContainer();
        this.setupStyles();
    }

    createContainer() {
        this.container = document.createElement('div');
        this.container.id = 'toast-container';
        this.container.className = 'toast-container';
        document.body.appendChild(this.container);
    }

    setupStyles() {
        if (document.getElementById('toast-styles')) return;

        const styles = document.createElement('style');
        styles.id = 'toast-styles';
        styles.textContent = `
            .toast-container {
                position: fixed;
                top: 20px;
                right: 20px;
                z-index: 10000;
                pointer-events: none;
            }
            
            .toast {
                background: white;
                border-radius: 12px;
                box-shadow: 0 8px 32px rgba(0,0,0,0.12);
                margin-bottom: 12px;
                padding: 16px 20px;
                min-width: 320px;
                max-width: 480px;
                pointer-events: auto;
                transform: translateX(400px);
                opacity: 0;
                transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                border-left: 4px solid var(--primary-color);
                display: flex;
                align-items: center;
                gap: 12px;
                position: relative;
                overflow: hidden;
            }
            
            .toast.show {
                transform: translateX(0);
                opacity: 1;
            }
            
            .toast.success { border-left-color: #10b981; }
            .toast.error { border-left-color: #ef4444; }
            .toast.warning { border-left-color: #f59e0b; }
            .toast.info { border-left-color: #3b82f6; }
            
            .toast-icon {
                width: 24px;
                height: 24px;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 12px;
                color: white;
                flex-shrink: 0;
            }
            
            .toast.success .toast-icon { background: #10b981; }
            .toast.error .toast-icon { background: #ef4444; }
            .toast.warning .toast-icon { background: #f59e0b; }
            .toast.info .toast-icon { background: #3b82f6; }
            
            .toast-content {
                flex: 1;
            }
            
            .toast-title {
                font-weight: 600;
                margin-bottom: 4px;
                color: #1f2937;
            }
            
            .toast-message {
                color: #6b7280;
                font-size: 14px;
                line-height: 1.4;
            }
            
            .toast-close {
                background: none;
                border: none;
                color: #9ca3af;
                cursor: pointer;
                padding: 4px;
                border-radius: 4px;
                transition: color 0.2s;
            }
            
            .toast-close:hover {
                color: #6b7280;
            }
            
            .toast-progress {
                position: absolute;
                bottom: 0;
                left: 0;
                height: 3px;
                background: var(--primary-color);
                transition: width linear;
            }
            
            .toast.success .toast-progress { background: #10b981; }
            .toast.error .toast-progress { background: #ef4444; }
            .toast.warning .toast-progress { background: #f59e0b; }
            .toast.info .toast-progress { background: #3b82f6; }
            
            @media (max-width: 640px) {
                .toast-container {
                    top: 10px;
                    right: 10px;
                    left: 10px;
                }
                
                .toast {
                    min-width: auto;
                    max-width: none;
                }
            }
            
            .dark-theme .toast {
                background: #374151;
                color: #f9fafb;
            }
            
            .dark-theme .toast-title {
                color: #f9fafb;
            }
            
            .dark-theme .toast-message {
                color: #d1d5db;
            }
        `;
        document.head.appendChild(styles);
    }

    show(options) {
        const {
            type = 'info',
            title,
            message,
            duration = 5000,
            persistent = false,
            actions = []
        } = options;

        const id = this.generateId();
        const toast = this.createToast(id, type, title, message, actions, persistent);
        
        this.container.appendChild(toast);
        this.toasts.set(id, { element: toast, timer: null });

        // Trigger animation
        requestAnimationFrame(() => {
            toast.classList.add('show');
        });

        // Auto-dismiss
        if (!persistent && duration > 0) {
            this.startTimer(id, duration);
        }

        // Accessibility announcement
        if (window.accessibilityManager) {
            window.accessibilityManager.announce(`${title || ''} ${message}`);
        }

        return id;
    }

    createToast(id, type, title, message, actions, persistent) {
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.setAttribute('role', 'alert');
        toast.setAttribute('aria-live', 'assertive');

        const iconMap = {
            success: 'fas fa-check',
            error: 'fas fa-times',
            warning: 'fas fa-exclamation',
            info: 'fas fa-info'
        };

        toast.innerHTML = `
            <div class="toast-icon">
                <i class="${iconMap[type]}"></i>
            </div>
            <div class="toast-content">
                ${title ? `<div class="toast-title">${title}</div>` : ''}
                <div class="toast-message">${message}</div>
                ${actions.length ? this.createActions(actions) : ''}
            </div>
            ${!persistent ? `<button class="toast-close" onclick="toastManager.dismiss('${id}')" aria-label="Close notification">
                <i class="fas fa-times"></i>
            </button>` : ''}
            ${!persistent ? '<div class="toast-progress"></div>' : ''}
        `;

        return toast;
    }

    createActions(actions) {
        return `
            <div class="toast-actions" style="margin-top: 8px; display: flex; gap: 8px;">
                ${actions.map(action => `
                    <button class="btn btn-sm" onclick="${action.handler}" style="padding: 4px 12px; font-size: 12px;">
                        ${action.label}
                    </button>
                `).join('')}
            </div>
        `;
    }

    startTimer(id, duration) {
        const toastData = this.toasts.get(id);
        if (!toastData) return;

        const progressBar = toastData.element.querySelector('.toast-progress');
        if (progressBar) {
            progressBar.style.width = '100%';
            progressBar.style.transitionDuration = `${duration}ms`;
            
            requestAnimationFrame(() => {
                progressBar.style.width = '0%';
            });
        }

        toastData.timer = setTimeout(() => {
            this.dismiss(id);
        }, duration);
    }

    dismiss(id) {
        const toastData = this.toasts.get(id);
        if (!toastData) return;

        if (toastData.timer) {
            clearTimeout(toastData.timer);
        }

        toastData.element.classList.remove('show');
        
        setTimeout(() => {
            if (toastData.element.parentNode) {
                toastData.element.remove();
            }
            this.toasts.delete(id);
        }, 300);
    }

    dismissAll() {
        this.toasts.forEach((_, id) => {
            this.dismiss(id);
        });
    }

    generateId() {
        return `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }

    // Convenience methods
    success(message, title, options = {}) {
        return this.show({ type: 'success', title, message, ...options });
    }

    error(message, title, options = {}) {
        return this.show({ type: 'error', title, message, ...options });
    }

    warning(message, title, options = {}) {
        return this.show({ type: 'warning', title, message, ...options });
    }

    info(message, title, options = {}) {
        return this.show({ type: 'info', title, message, ...options });
    }
}

// Initialize toast manager
document.addEventListener('DOMContentLoaded', () => {
    window.toastManager = new ToastManager();
});