// Interactive Charts Component
class ChartComponent {
    constructor() {
        this.charts = new Map();
        this.init();
    }

    init() {
        this.loadChartLibrary();
        this.setupStyles();
    }

    async loadChartLibrary() {
        if (window.Chart) return;

        // Load Chart.js dynamically
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.js';
        script.onload = () => {
            console.log('Chart.js loaded');
            this.initializeCharts();
        };
        document.head.appendChild(script);
    }

    setupStyles() {
        const styles = document.createElement('style');
        styles.textContent = `
            .chart-container {
                position: relative;
                background: white;
                border-radius: 12px;
                padding: 20px;
                box-shadow: 0 2px 8px rgba(0,0,0,0.1);
                margin-bottom: 20px;
            }
            
            .chart-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 20px;
            }
            
            .chart-title {
                font-size: 18px;
                font-weight: 600;
                color: #1f2937;
            }
            
            .chart-controls {
                display: flex;
                gap: 8px;
            }
            
            .chart-control-btn {
                padding: 6px 12px;
                border: 1px solid #d1d5db;
                background: white;
                border-radius: 6px;
                font-size: 12px;
                cursor: pointer;
                transition: all 0.2s;
            }
            
            .chart-control-btn:hover {
                background: #f3f4f6;
            }
            
            .chart-control-btn.active {
                background: var(--primary-color);
                color: white;
                border-color: var(--primary-color);
            }
            
            .chart-canvas {
                max-height: 400px;
            }
            
            .dark-theme .chart-container {
                background: #1f2937;
            }
            
            .dark-theme .chart-title {
                color: #f9fafb;
            }
            
            .dark-theme .chart-control-btn {
                background: #374151;
                border-color: #4b5563;
                color: #f9fafb;
            }
        `;
        document.head.appendChild(styles);
    }

    initializeCharts() {
        // Portfolio Performance Chart
        this.createPortfolioChart();
        
        // Loan Distribution Chart
        this.createLoanDistributionChart();
        
        // Monthly Returns Chart
        this.createReturnsChart();
        
        // Risk Assessment Chart
        this.createRiskChart();
    }

    createPortfolioChart() {
        const container = document.getElementById('portfolio-chart');
        if (!container) return;

        const canvas = this.createChartCanvas('portfolio-performance');
        const chartContainer = this.createChartContainer(
            'Portfolio Performance',
            canvas,
            ['1M', '3M', '6M', '1Y', 'ALL']
        );
        
        container.appendChild(chartContainer);

        const ctx = canvas.getContext('2d');
        const chart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
                datasets: [{
                    label: 'Portfolio Value',
                    data: [10000, 12000, 11500, 13000, 14500, 15200],
                    borderColor: '#00d4aa',
                    backgroundColor: 'rgba(0, 212, 170, 0.1)',
                    fill: true,
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: false,
                        ticks: {
                            callback: function(value) {
                                return '$' + value.toLocaleString();
                            }
                        }
                    }
                }
            }
        });

        this.charts.set('portfolio', chart);
    }

    createLoanDistributionChart() {
        const container = document.getElementById('loan-distribution-chart');
        if (!container) return;

        const canvas = this.createChartCanvas('loan-distribution');
        const chartContainer = this.createChartContainer(
            'Loan Distribution by Crop Type',
            canvas
        );
        
        container.appendChild(chartContainer);

        const ctx = canvas.getContext('2d');
        const chart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['Maize', 'Coffee', 'Rice', 'Wheat', 'Other'],
                datasets: [{
                    data: [35, 25, 20, 15, 5],
                    backgroundColor: [
                        '#00d4aa',
                        '#3b82f6',
                        '#f59e0b',
                        '#ef4444',
                        '#8b5cf6'
                    ],
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom'
                    }
                }
            }
        });

        this.charts.set('distribution', chart);
    }

    createReturnsChart() {
        const container = document.getElementById('returns-chart');
        if (!container) return;

        const canvas = this.createChartCanvas('monthly-returns');
        const chartContainer = this.createChartContainer(
            'Monthly Returns',
            canvas,
            ['6M', '1Y', '2Y']
        );
        
        container.appendChild(chartContainer);

        const ctx = canvas.getContext('2d');
        const chart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
                datasets: [{
                    label: 'Returns (%)',
                    data: [8.2, 7.8, 9.1, 8.5, 9.3, 8.7],
                    backgroundColor: '#00d4aa',
                    borderRadius: 4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: function(value) {
                                return value + '%';
                            }
                        }
                    }
                }
            }
        });

        this.charts.set('returns', chart);
    }

    createRiskChart() {
        const container = document.getElementById('risk-chart');
        if (!container) return;

        const canvas = this.createChartCanvas('risk-assessment');
        const chartContainer = this.createChartContainer(
            'Risk vs Return Analysis',
            canvas
        );
        
        container.appendChild(chartContainer);

        const ctx = canvas.getContext('2d');
        const chart = new Chart(ctx, {
            type: 'scatter',
            data: {
                datasets: [{
                    label: 'Loans',
                    data: [
                        {x: 2.1, y: 8.2},
                        {x: 3.5, y: 9.1},
                        {x: 1.8, y: 7.5},
                        {x: 4.2, y: 10.3},
                        {x: 2.8, y: 8.8}
                    ],
                    backgroundColor: '#00d4aa',
                    borderColor: '#00d4aa'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    x: {
                        title: {
                            display: true,
                            text: 'Risk Score'
                        }
                    },
                    y: {
                        title: {
                            display: true,
                            text: 'Expected Return (%)'
                        }
                    }
                }
            }
        });

        this.charts.set('risk', chart);
    }

    createChartCanvas(id) {
        const canvas = document.createElement('canvas');
        canvas.id = id;
        canvas.className = 'chart-canvas';
        return canvas;
    }

    createChartContainer(title, canvas, controls = []) {
        const container = document.createElement('div');
        container.className = 'chart-container';

        const header = document.createElement('div');
        header.className = 'chart-header';

        const titleEl = document.createElement('h3');
        titleEl.className = 'chart-title';
        titleEl.textContent = title;

        header.appendChild(titleEl);

        if (controls.length > 0) {
            const controlsEl = document.createElement('div');
            controlsEl.className = 'chart-controls';

            controls.forEach((control, index) => {
                const btn = document.createElement('button');
                btn.className = `chart-control-btn ${index === 0 ? 'active' : ''}`;
                btn.textContent = control;
                btn.addEventListener('click', () => {
                    controlsEl.querySelectorAll('.chart-control-btn').forEach(b => 
                        b.classList.remove('active')
                    );
                    btn.classList.add('active');
                    this.updateChartPeriod(canvas.id, control);
                });
                controlsEl.appendChild(btn);
            });

            header.appendChild(controlsEl);
        }

        container.appendChild(header);
        container.appendChild(canvas);

        return container;
    }

    updateChartPeriod(chartId, period) {
        // Update chart data based on selected period
        console.log(`Updating ${chartId} for period: ${period}`);
        
        // This would typically fetch new data from an API
        // For demo purposes, we'll just log the action
    }

    // Utility method to update chart data
    updateChart(chartId, newData) {
        const chart = this.charts.get(chartId);
        if (chart) {
            chart.data = newData;
            chart.update();
        }
    }

    // Method to destroy all charts (useful for cleanup)
    destroyCharts() {
        this.charts.forEach(chart => chart.destroy());
        this.charts.clear();
    }
}

// Export for dynamic loading
export { ChartComponent };
if (typeof window !== 'undefined') {
    window.ChartComponent = ChartComponent;
}