// Enhanced Transaction System for Hedera AgriFund
class TransactionManager {
    constructor(app) {
        this.app = app;
        this.currentTransaction = null;
        this.transactionQueue = [];
        this.isProcessing = false;
        this.currentLang = localStorage.getItem('language') || 'fr';

        this.messages = {
            fr: {
                confirm: {
                    title: 'Confirmer la transaction',
                    amount: 'Montant: {amount}',
                    fees: 'Frais réseau: ~{fees}',
                    time: 'Temps estimé: {time}',
                    security: 'Sécurisé par la blockchain Hedera',
                    cancel: 'Annuler',
                    confirm: 'Confirmer'
                },
                progress: {
                    signing: 'Signature en cours...',
                    signing_desc: 'Confirmez dans votre portefeuille',
                    broadcasting: 'Envoi sur la blockchain...',
                    broadcasting_desc: 'Transaction: {txHash}',
                    confirming: 'Confirmation en cours...',
                    confirming_desc: 'Finalisation sur la blockchain',
                    success: 'Transaction réussie !',
                    success_desc: 'Vos changements ont été enregistrés'
                },
                errors: {
                    wallet_rejected: 'Transaction annulée dans votre portefeuille',
                    network_error: 'Erreur réseau. Vérifiez votre connexion.',
                    insufficient_funds: 'Fonds insuffisants pour les frais',
                    generic: 'Transaction échouée. Veuillez réessayer.',
                    timeout: 'Transaction expirée. Veuillez réessayer.'
                }
            },
            en: {
                confirm: {
                    title: 'Confirm Transaction',
                    amount: 'Amount: {amount}',
                    fees: 'Network fees: ~{fees}',
                    time: 'Estimated time: {time}',
                    security: 'Secured by Hedera blockchain',
                    cancel: 'Cancel',
                    confirm: 'Confirm'
                },
                // ... English translations
            }
        };
    }

    // Show transaction confirmation modal
    showTransactionConfirmation(transactionData) {
        return new Promise((resolve, reject) => {
            const modal = document.createElement('div');
            modal.className = 'modal transaction-modal active';
            modal.id = 'transactionConfirmModal';
            modal.setAttribute('role', 'dialog');
            modal.setAttribute('aria-modal', 'true');
            modal.setAttribute('aria-labelledby', 'tx-modal-title');

            const {
                title,
                description,
                amount,
                estimatedFee = '$0.05',
                estimatedTime = '3-5 seconds',
                breakdown = [],
                risks = []
            } = transactionData;

            modal.innerHTML = `
                <div class="modal-content tx-confirm-modal">
                    <div class="modal-header">
                        <h3 id="tx-modal-title">
                            <i class="fas fa-shield-alt" aria-hidden="true"></i>
                            ${this.t('confirm.title')}
                        </h3>
                        <button class="modal-close" onclick="txManager.cancelTransaction()" aria-label="Fermer">
                            <i class="fas fa-times" aria-hidden="true"></i>
                        </button>
                    </div>
                    
                    <div class="modal-body">
                        <div class="tx-summary">
                            <h4>${title}</h4>
                            <p class="tx-description">${description}</p>
                            
                            <div class="tx-details">
                                <div class="tx-item primary">
                                    <span class="tx-label">${this.t('confirm.amount')}</span>
                                    <span class="tx-value">${amount}</span>
                                </div>
                                
                                ${breakdown.map(item => `
                                    <div class="tx-item">
                                        <span class="tx-label">${item.label}:</span>
                                        <span class="tx-value">${item.value}</span>
                                    </div>
                                `).join('')}
                                
                                <div class="tx-item">
                                    <span class="tx-label">${this.t('confirm.fees')}</span>
                                    <span class="tx-fee">${estimatedFee}</span>
                                </div>
                                <div class="tx-item">
                                    <span class="tx-label">${this.t('confirm.time')}</span>
                                    <span class="tx-time">${estimatedTime}</span>
                                </div>
                            </div>
                        </div>
                        
                        ${risks.length > 0 ? `
                            <div class="tx-risks">
                                <h5><i class="fas fa-exclamation-triangle" aria-hidden="true"></i> Points d'attention</h5>
                                <ul role="list">
                                    ${risks.map(risk => `<li role="listitem">${risk}</li>`).join('')}
                                </ul>
                            </div>
                        ` : ''}
                        
                        <div class="tx-security">
                            <div class="security-badge">
                                <i class="fas fa-lock" aria-hidden="true"></i>
                                <span>${this.t('confirm.security')}</span>
                            </div>
                            <div class="security-features">
                                <small>• Transaction enregistrée de façon permanente</small>
                                <small>• Vérifiable publiquement sur Hedera</small>
                                <small>• Frais parmi les plus bas du marché</small>
                            </div>
                        </div>
                    </div>
                    
                    <div class="modal-actions">
                        <button class="btn-secondary" onclick="txManager.cancelTransaction()" aria-label="Annuler la transaction">
                            ${this.t('confirm.cancel')}
                        </button>
                        <button class="btn-primary" onclick="txManager.confirmTransaction()" aria-label="Confirmer la transaction">
                            <i class="fas fa-check" aria-hidden="true"></i>
                            ${this.t('confirm.confirm')}
                        </button>
                    </div>
                </div>
            `;

            document.body.appendChild(modal);

            // Store promise resolvers
            this.currentTransaction = { resolve, reject, data: transactionData };

            // Focus management
            modal.querySelector('.btn-primary').focus();

            // Setup keyboard navigation
            this.setupTransactionKeyboardNav(modal);
        });
    }

    // Show transaction progress
    showTransactionProgress(stage, txHash = null, additionalData = {}) {
        const overlay = document.getElementById('loadingOverlay') || this.createLoadingOverlay();

        const stages = {
            signing: {
                icon: 'fas fa-pen-alt fa-pulse',
                title: this.t('progress.signing'),
                subtitle: this.t('progress.signing_desc'),
                showCancel: true
            },
            broadcasting: {
                icon: 'fas fa-satellite fa-spin',
                title: this.t('progress.broadcasting'),
                subtitle: this.t('progress.broadcasting_desc', {
                    txHash: txHash ? `${txHash.substring(0, 10)}...` : ''
                }),
                showCancel: false
            },
            confirming: {
                icon: 'fas fa-hourglass-half fa-pulse',
                title: this.t('progress.confirming'),
                subtitle: this.t('progress.confirming_desc'),
                showCancel: false
            },
            success: {
                icon: 'fas fa-check-circle text-success',
                title: this.t('progress.success'),
                subtitle: this.t('progress.success_desc'),
                showCancel: false,
                showContinue: true
            },
            error: {
                icon: 'fas fa-exclamation-triangle text-error',
                title: 'Transaction échouée',
                subtitle: additionalData.errorMessage || 'Une erreur est survenue',
                showCancel: false,
                showRetry: true
            }
        };

        const stageData = stages[stage];
        if (!stageData) return;

        overlay.innerHTML = `
            <div class="loading-content tx-progress">
                <div class="progress-icon">
                    <i class="${stageData.icon}"></i>
                </div>
                
                <div class="progress-text">
                    <h3>${stageData.title}</h3>
                    <p>${stageData.subtitle}</p>
                </div>
                
                ${stage === 'broadcasting' && txHash ? `
                    <div class="tx-hash-info">
                        <small>ID Transaction: ${txHash}</small>
                        <button class="btn-link" onclick="txManager.openExplorer('${txHash}')" 
                                aria-label="Voir sur l'explorateur">
                            <i class="fas fa-external-link-alt" aria-hidden="true"></i>
                            Voir détails
                        </button>
                    </div>
                ` : ''}
                
                ${stage !== 'success' && stage !== 'error' ? `
                    <div class="loading-animation">
                        <div class="loading-dots">
                            <span></span><span></span><span></span>
                        </div>
                    </div>
                ` : ''}
                
                <div class="progress-actions">
                    ${stageData.showCancel ? `
                        <button class="btn-secondary" onclick="txManager.cancelTransaction()" 
                                aria-label="Annuler">
                            Annuler
                        </button>
                    ` : ''}
                    
                    ${stageData.showContinue ? `
                        <button class="btn-primary" onclick="txManager.closeTransactionProgress()" 
                                aria-label="Continuer">
                            Continuer
                        </button>
                    ` : ''}
                    
                    ${stageData.showRetry ? `
                        <button class="btn-primary" onclick="txManager.retryTransaction()" 
                                aria-label="Réessayer">
                            <i class="fas fa-redo" aria-hidden="true"></i>
                            Réessayer
                        </button>
                        <button class="btn-secondary" onclick="txManager.closeTransactionProgress()" 
                                aria-label="Fermer">
                            Fermer
                        </button>
                    ` : ''}
                </div>
            </div>
        `;

        overlay.classList.add('active');

        // Auto-hide success after delay
        if (stage === 'success') {
            setTimeout(() => {
                this.closeTransactionProgress();
                this.showSuccessToast(additionalData.successMessage);
            }, 2000);
        }

        // Store current stage for retry functionality
        this.currentStage = stage;
    }

    // Create loading overlay if it doesn't exist
    createLoadingOverlay() {
        const overlay = document.createElement('div');
        overlay.id = 'loadingOverlay';
        overlay.className = 'loading-overlay';
        overlay.setAttribute('role', 'dialog');
        overlay.setAttribute('aria-modal', 'true');
        overlay.setAttribute('aria-labelledby', 'loading-title');

        document.body.appendChild(overlay);
        return overlay;
    }

    // Process transaction through all stages
    async processTransaction(transactionFunction, transactionData) {
        try {
            this.isProcessing = true;

            // Stage 1: Show confirmation
            await this.showTransactionConfirmation(transactionData);

            // Stage 2: Signing
            this.showTransactionProgress('signing');

            // Execute transaction function
            const result = await transactionFunction();

            if (result.txHash) {
                // Stage 3: Broadcasting
                this.showTransactionProgress('broadcasting', result.txHash);

                // Wait for confirmation
                await this.waitForConfirmation(result.txHash);

                // Stage 4: Success
                this.showTransactionProgress('success', result.txHash, {
                    successMessage: transactionData.successMessage
                });

                return result;
            }

        } catch (error) {
            console.error('Transaction error:', error);

            let errorMessage = this.t('errors.generic');

            // Map specific errors
            if (error.message.includes('rejected')) {
                errorMessage = this.t('errors.wallet_rejected');
            } else if (error.message.includes('network')) {
                errorMessage = this.t('errors.network_error');
            } else if (error.message.includes('insufficient')) {
                errorMessage = this.t('errors.insufficient_funds');
            }

            this.showTransactionProgress('error', null, { errorMessage });
            throw error;

        } finally {
            this.isProcessing = false;
        }
    }

    // Confirm transaction
    confirmTransaction() {
        if (this.currentTransaction) {
            this.currentTransaction.resolve(true);
            this.closeModal('transactionConfirmModal');
        }
    }

    // Cancel transaction
    cancelTransaction() {
        if (this.currentTransaction) {
            this.currentTransaction.reject(new Error('User cancelled'));
            this.currentTransaction = null;
        }

        this.closeModal('transactionConfirmModal');
        this.closeTransactionProgress();
    }

    // Retry transaction
    retryTransaction() {
        if (this.currentTransaction) {
            // Close current progress
            this.closeTransactionProgress();

            // Restart the process
            setTimeout(() => {
                this.showTransactionConfirmation(this.currentTransaction.data);
            }, 300);
        }
    }

    // Close transaction progress
    closeTransactionProgress() {
        const overlay = document.getElementById('loadingOverlay');
        if (overlay) {
            overlay.classList.remove('active');
        }
    }

    // Close modal
    closeModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.remove();
        }
    }

    // Wait for transaction confirmation
    async waitForConfirmation(txHash, maxAttempts = 30) {
        for (let i = 0; i < maxAttempts; i++) {
            try {
                // Check transaction status (implement with your Hedera integration)
                const status = await this.app.hedera.getTransactionStatus(txHash);

                if (status === 'SUCCESS') {
                    return true;
                } else if (status === 'FAILED') {
                    throw new Error('Transaction failed on network');
                }

                // Wait 1 second before next check
                await new Promise(resolve => setTimeout(resolve, 1000));

            } catch (error) {
                if (i === maxAttempts - 1) {
                    throw new Error('Transaction confirmation timeout');
                }
            }
        }
    }

    // Show success toast
    showSuccessToast(message) {
        const toast = document.createElement('div');
        toast.className = 'success-toast';
        toast.innerHTML = `
            <div class="toast-content">
                <i class="fas fa-check-circle" aria-hidden="true"></i>
                <span>${message || 'Transaction réussie !'}</span>
            </div>
        `;

        document.body.appendChild(toast);

        setTimeout(() => toast.classList.add('show'), 100);
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }

    // Open block explorer
    openExplorer(txHash) {
        const explorerUrl = `https://hashscan.io/#/mainnet/transaction/${txHash}`;
        window.open(explorerUrl, '_blank', 'noopener,noreferrer');
    }

    // Setup keyboard navigation for transaction modal
    setupTransactionKeyboardNav(modal) {
        const focusableElements = modal.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );

        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        modal.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.cancelTransaction();
            } else if (e.key === 'Tab') {
                if (e.shiftKey && document.activeElement === firstElement) {
                    e.preventDefault();
                    lastElement.focus();
                } else if (!e.shiftKey && document.activeElement === lastElement) {
                    e.preventDefault();
                    firstElement.focus();
                }
            }
        });
    }

    // Translation helper
    t(key, params = {}) {
        const keys = key.split('.');
        let value = this.messages[this.currentLang];

        for (const k of keys) {
            value = value?.[k];
        }

        if (typeof value === 'string') {
            return value.replace(/\{(\w+)\}/g, (match, param) => params[param] || match);
        }

        return value || key;
    }

    // Queue transaction for offline processing
    queueTransaction(transactionData) {
        const queue = JSON.parse(localStorage.getItem('txQueue') || '[]');
        queue.push({
            ...transactionData,
            timestamp: Date.now(),
            id: Date.now().toString(36) + Math.random().toString(36).substr(2)
        });
        localStorage.setItem('txQueue', JSON.stringify(queue));

        this.showOfflineNotification();
    }

    // Show offline notification
    showOfflineNotification() {
        const notification = document.createElement('div');
        notification.className = 'offline-notification';
        notification.innerHTML = `
            <div class="notification-content">
                <i class="fas fa-wifi-slash" aria-hidden="true"></i>
                <div>
                    <strong>Mode hors ligne</strong>
                    <p>Transaction mise en file d'attente. Elle sera traitée dès la reconnexion.</p>
                </div>
            </div>
        `;

        document.body.appendChild(notification);

        setTimeout(() => notification.classList.add('show'), 100);
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        }, 5000);
    }

    // Process queued transactions when back online
    async processQueuedTransactions() {
        const queue = JSON.parse(localStorage.getItem('txQueue') || '[]');

        if (queue.length === 0) return;

        for (const tx of queue) {
            try {
                await this.processTransaction(tx.function, tx.data);

                // Remove from queue on success
                const updatedQueue = queue.filter(item => item.id !== tx.id);
                localStorage.setItem('txQueue', JSON.stringify(updatedQueue));

            } catch (error) {
                console.error('Failed to process queued transaction:', error);
                // Keep in queue for next retry
            }
        }
    }
}

// Global transaction manager instance
window.txManager = null;

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    // Will be initialized by main app
});

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = TransactionManager;
}

