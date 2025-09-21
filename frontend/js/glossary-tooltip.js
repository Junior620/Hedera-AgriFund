// Glossary and Tooltip System for Hedera AgriFund
class GlossaryTooltipSystem {
    constructor() {
        this.currentTooltip = null;
        this.glossaryData = this.initializeGlossary();
        this.currentLang = localStorage.getItem('language') || 'fr';
    }

    // Initialize the system
    init() {
        this.setupTooltipTriggers();
        this.createGlossaryModal();
        this.setupKeyboardNavigation();
    }

    // Initialize glossary data
    initializeGlossary() {
        return {
            fr: {
                'ltv': {
                    term: 'Ratio de Couverture (LTV)',
                    definition: 'Pourcentage de la valeur de vos récoltes que vous pouvez emprunter. Maximum 85% pour limiter les risques.',
                    example: 'Si votre maïs vaut 4 000$, vous pouvez emprunter jusqu\'à 3 400$ (85% LTV).',
                    category: 'Financement'
                },
                'tokenization': {
                    term: 'Reçu Numérique',
                    definition: 'Certificat blockchain sécurisé prouvant que vous possédez des récoltes stockées dans un entrepôt certifié.',
                    example: 'Votre reçu de 500kg de café devient un token numérique utilisable comme garantie.',
                    category: 'Blockchain'
                },
                'apr': {
                    term: 'Taux Annuel Effectif',
                    definition: 'Coût total de votre prêt sur une année, incluant intérêts et tous les frais.',
                    example: 'Un prêt à 8.5% APR coûte 85$ d\'intérêts par an pour 1 000$ empruntés.',
                    category: 'Financement'
                },
                'collateral': {
                    term: 'Garantie',
                    definition: 'Vos récoltes stockées qui garantissent le remboursement de votre prêt.',
                    example: 'Vos 1 000kg de riz servent de garantie pour votre prêt de 2 500$.',
                    category: 'Financement'
                },
                'oracle': {
                    term: 'Oracle de Prix',
                    definition: 'Service automatisé qui fournit les prix actuels des récoltes en temps réel.',
                    example: 'L\'oracle met à jour le prix du maïs toutes les heures selon les marchés mondiaux.',
                    category: 'Blockchain'
                },
                'smart_contract': {
                    term: 'Contrat Intelligent',
                    definition: 'Programme automatique qui exécute les conditions de votre prêt sans intermédiaire.',
                    example: 'Le contrat rembourse automatiquement les prêteurs quand vous payez.',
                    category: 'Blockchain'
                },
                'hts': {
                    term: 'Token Hedera (HTS)',
                    definition: 'Standard de token natif sur Hedera, plus rapide et moins cher qu\'Ethereum.',
                    example: 'Votre reçu numérique est créé comme token HTS en 3 secondes.',
                    category: 'Blockchain'
                },
                'escrow': {
                    term: 'Dépôt de Garantie',
                    definition: 'Système où vos fonds sont sécurisés jusqu\'à ce que les conditions soient remplies.',
                    example: 'Vos récoltes restent en escrow jusqu\'au remboursement complet.',
                    category: 'Financement'
                }
            },
            en: {
                'ltv': {
                    term: 'Loan-to-Value Ratio (LTV)',
                    definition: 'Percentage of your crop value that you can borrow. Maximum 85% to limit risks.',
                    example: 'If your corn is worth $4,000, you can borrow up to $3,400 (85% LTV).',
                    category: 'Finance'
                },
                'tokenization': {
                    term: 'Digital Receipt',
                    definition: 'Secure blockchain certificate proving you own crops stored in a certified warehouse.',
                    example: 'Your receipt for 500kg of coffee becomes a digital token usable as collateral.',
                    category: 'Blockchain'
                },
                // ... other terms in English
            }
        };
    }

    // Setup tooltip triggers
    setupTooltipTriggers() {
        // Auto-detect terms in content
        this.scanForTerms();

        // Manual triggers
        document.addEventListener('mouseenter', (e) => {
            if (e.target.hasAttribute('data-tooltip')) {
                this.showTooltip(e.target, e.target.dataset.tooltip);
            }
        }, true);

        document.addEventListener('mouseleave', (e) => {
            if (e.target.hasAttribute('data-tooltip')) {
                this.hideTooltip();
            }
        }, true);

        // Touch support for mobile
        document.addEventListener('touchstart', (e) => {
            if (e.target.hasAttribute('data-tooltip')) {
                e.preventDefault();
                this.showTooltip(e.target, e.target.dataset.tooltip);
            }
        }, true);
    }

    // Scan page content for glossary terms
    scanForTerms() {
        const textNodes = this.getTextNodes(document.body);
        const terms = Object.keys(this.glossaryData[this.currentLang]);

        textNodes.forEach(node => {
            let text = node.textContent;
            let modified = false;

            terms.forEach(term => {
                const termData = this.glossaryData[this.currentLang][term];
                const regex = new RegExp(`\\b${termData.term}\\b`, 'gi');

                if (regex.test(text)) {
                    const wrapper = document.createElement('span');
                    wrapper.innerHTML = text.replace(regex, (match) => {
                        return `<span class="glossary-term" data-tooltip="${term}" tabindex="0" role="button" aria-label="Définition disponible: ${match}">${match}</span>`;
                    });

                    // Replace text node with wrapped version
                    node.parentNode.insertBefore(wrapper, node);
                    node.parentNode.removeChild(node);
                    modified = true;
                }
            });
        });
    }

    // Get all text nodes
    getTextNodes(element) {
        const textNodes = [];
        const walker = document.createTreeWalker(
            element,
            NodeFilter.SHOW_TEXT,
            {
                acceptNode: (node) => {
                    // Skip script and style elements
                    const parent = node.parentElement;
                    if (parent && ['SCRIPT', 'STYLE', 'NOSCRIPT'].includes(parent.tagName)) {
                        return NodeFilter.FILTER_REJECT;
                    }
                    return node.textContent.trim() ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT;
                }
            }
        );

        let node;
        while (node = walker.nextNode()) {
            textNodes.push(node);
        }
        return textNodes;
    }

    // Show tooltip
    showTooltip(element, termKey) {
        this.hideTooltip(); // Hide any existing tooltip

        const termData = this.glossaryData[this.currentLang][termKey];
        if (!termData) return;

        const tooltip = document.createElement('div');
        tooltip.className = 'glossary-tooltip';
        tooltip.setAttribute('role', 'tooltip');
        tooltip.innerHTML = `
            <div class="tooltip-header">
                <h4>${termData.term}</h4>
                <span class="tooltip-category">${termData.category}</span>
            </div>
            <div class="tooltip-content">
                <p>${termData.definition}</p>
                ${termData.example ? `<div class="tooltip-example"><strong>Exemple:</strong> ${termData.example}</div>` : ''}
            </div>
            <div class="tooltip-actions">
                <button class="btn-link" onclick="glossary.showFullGlossary('${termKey}')">
                    Voir plus <i class="fas fa-external-link-alt" aria-hidden="true"></i>
                </button>
            </div>
        `;

        document.body.appendChild(tooltip);
        this.currentTooltip = tooltip;

        // Position tooltip
        this.positionTooltip(tooltip, element);

        // Auto-hide after delay on mobile
        if (this.isMobile()) {
            setTimeout(() => this.hideTooltip(), 5000);
        }
    }

    // Position tooltip relative to element
    positionTooltip(tooltip, element) {
        const rect = element.getBoundingClientRect();
        const tooltipRect = tooltip.getBoundingClientRect();

        let top = rect.top - tooltipRect.height - 10;
        let left = rect.left + (rect.width / 2) - (tooltipRect.width / 2);

        // Adjust if tooltip goes off screen
        if (top < 10) {
            top = rect.bottom + 10;
            tooltip.classList.add('tooltip-below');
        }

        if (left < 10) {
            left = 10;
        } else if (left + tooltipRect.width > window.innerWidth - 10) {
            left = window.innerWidth - tooltipRect.width - 10;
        }

        tooltip.style.top = `${top + window.scrollY}px`;
        tooltip.style.left = `${left}px`;
    }

    // Hide tooltip
    hideTooltip() {
        if (this.currentTooltip) {
            this.currentTooltip.remove();
            this.currentTooltip = null;
        }
    }

    // Create glossary modal
    createGlossaryModal() {
        const modal = document.createElement('div');
        modal.id = 'glossaryModal';
        modal.className = 'modal glossary-modal';
        modal.setAttribute('role', 'dialog');
        modal.setAttribute('aria-modal', 'true');
        modal.setAttribute('aria-labelledby', 'glossary-title');

        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h2 id="glossary-title">
                        <i class="fas fa-book" aria-hidden="true"></i>
                        Glossaire AgriFund
                    </h2>
                    <button class="modal-close" onclick="glossary.closeGlossary()" aria-label="Fermer le glossaire">
                        <i class="fas fa-times" aria-hidden="true"></i>
                    </button>
                </div>
                
                <div class="modal-body">
                    <div class="glossary-search">
                        <div class="search-input-group">
                            <i class="fas fa-search" aria-hidden="true"></i>
                            <input type="text" id="glossarySearch" placeholder="Rechercher un terme..." 
                                   aria-label="Rechercher dans le glossaire">
                        </div>
                        
                        <div class="glossary-filters">
                            <button class="filter-btn active" data-category="all">Tous</button>
                            <button class="filter-btn" data-category="Financement">Financement</button>
                            <button class="filter-btn" data-category="Blockchain">Blockchain</button>
                        </div>
                    </div>
                    
                    <div class="glossary-content" id="glossaryContent">
                        <!-- Terms will be populated here -->
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
        this.setupGlossarySearch();
    }

    // Setup glossary search and filtering
    setupGlossarySearch() {
        const searchInput = document.getElementById('glossarySearch');
        const filterBtns = document.querySelectorAll('.filter-btn');

        // Search functionality
        searchInput.addEventListener('input', (e) => {
            this.filterGlossary(e.target.value, this.getCurrentFilter());
        });

        // Category filtering
        filterBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                filterBtns.forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                this.filterGlossary(searchInput.value, e.target.dataset.category);
            });
        });
    }

    // Show full glossary
    showFullGlossary(highlightTerm = null) {
        const modal = document.getElementById('glossaryModal');
        this.populateGlossary();
        modal.classList.add('active');

        // Focus management
        const searchInput = document.getElementById('glossarySearch');
        searchInput.focus();

        // Highlight specific term if provided
        if (highlightTerm) {
            setTimeout(() => {
                const termElement = document.querySelector(`[data-term="${highlightTerm}"]`);
                if (termElement) {
                    termElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    termElement.classList.add('highlighted');
                }
            }, 300);
        }
    }

    // Populate glossary content
    populateGlossary() {
        const content = document.getElementById('glossaryContent');
        const terms = this.glossaryData[this.currentLang];

        const termsHTML = Object.entries(terms).map(([key, data]) => `
            <div class="glossary-term-card" data-term="${key}" data-category="${data.category}">
                <div class="term-header">
                    <h3>${data.term}</h3>
                    <span class="term-category">${data.category}</span>
                </div>
                <div class="term-definition">
                    <p>${data.definition}</p>
                    ${data.example ? `
                        <div class="term-example">
                            <strong>Exemple:</strong> ${data.example}
                        </div>
                    ` : ''}
                </div>
            </div>
        `).join('');

        content.innerHTML = termsHTML;
    }

    // Filter glossary terms
    filterGlossary(searchTerm, category) {
        const terms = document.querySelectorAll('.glossary-term-card');

        terms.forEach(term => {
            const termData = term.querySelector('h3').textContent.toLowerCase();
            const termCategory = term.dataset.category;
            const definition = term.querySelector('.term-definition p').textContent.toLowerCase();

            const matchesSearch = !searchTerm ||
                termData.includes(searchTerm.toLowerCase()) ||
                definition.includes(searchTerm.toLowerCase());

            const matchesCategory = category === 'all' || termCategory === category;

            term.style.display = matchesSearch && matchesCategory ? 'block' : 'none';
        });
    }

    // Get current filter
    getCurrentFilter() {
        const activeFilter = document.querySelector('.filter-btn.active');
        return activeFilter ? activeFilter.dataset.category : 'all';
    }

    // Close glossary modal
    closeGlossary() {
        const modal = document.getElementById('glossaryModal');
        modal.classList.remove('active');
    }

    // Setup keyboard navigation
    setupKeyboardNavigation() {
        document.addEventListener('keydown', (e) => {
            // ESC to close
            if (e.key === 'Escape') {
                this.hideTooltip();
                this.closeGlossary();
            }

            // Enter/Space on glossary terms
            if ((e.key === 'Enter' || e.key === ' ') && e.target.classList.contains('glossary-term')) {
                e.preventDefault();
                this.showTooltip(e.target, e.target.dataset.tooltip);
            }
        });
    }

    // Detect mobile device
    isMobile() {
        return window.innerWidth <= 768 || 'ontouchstart' in window;
    }

    // Change language
    setLanguage(lang) {
        this.currentLang = lang;
        localStorage.setItem('language', lang);

        // Re-scan for terms
        document.querySelectorAll('.glossary-term').forEach(term => {
            term.outerHTML = term.textContent; // Remove tooltip wrapper
        });
        this.scanForTerms();

        // Update glossary if open
        if (document.getElementById('glossaryModal').classList.contains('active')) {
            this.populateGlossary();
        }
    }
}

// Initialize system
const glossary = new GlossaryTooltipSystem();

// Auto-initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    glossary.init();
});

// Global functions for onclick handlers
window.glossary = glossary;
