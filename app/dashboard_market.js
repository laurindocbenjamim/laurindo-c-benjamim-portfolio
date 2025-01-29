class FinancialDataHandler {
    constructor() {
        this.baseUrl = 'http://localhost:5000/api';
        this.charts = {};
        this.initDashboard();
    }

    initDashboard() {
        this.initDatePresets();
        this.initEventListeners();
        this.loadInitialData();
    }

    initDatePresets() {
        const presets = {
            '1D': '1d',
            '1W': '5d',
            '1M': '1mo',
            '3M': '3mo',
            '6M': '6mo',
            '1Y': '1y',
            'YTD': 'ytd',
            'MAX': 'max'
        };

        const container = document.getElementById('periodPresets');
        Object.entries(presets).forEach(([label, period]) => {
            const btn = document.createElement('button');
            btn.className = 'btn btn-outline-primary mx-1';
            btn.textContent = label;
            btn.dataset.period = period;
            btn.addEventListener('click', (e) => this.handlePeriodChange(e));
            container.appendChild(btn);
        });
    }

    handlePeriodChange(event) {
        const period = event.target.dataset.period;
        this.updateData(period);
    }

    async loadInitialData() {
        const params = new URLSearchParams(window.location.search);
        const period = params.get('period') || '1mo';
        await this.updateData(period);
    }

    async updateData(period) {
        try {
            const [stocks, crypto] = await Promise.all([
                this.fetchFinancialData('stocks', period),
                this.fetchFinancialData('crypto', period)
            ]);
            
            this.updateCharts(stocks, crypto);
            this.updatePriceDisplays(stocks, crypto);
            this.updateMetadata(stocks, crypto);
        } catch (error) {
            this.showError(error.message);
        }
    }

    async fetchFinancialData(type, period) {
        const endpoint = type === 'stocks' 
            ? `${this.baseUrl}/stocks?period=${period}&symbols=AAPL,MSFT,NVDA,GOOGL` 
            : `${this.baseUrl}/crypto?period=${period}&coins=BTC-USD,ETH-USD,BNB-USD`;

        const response = await fetch(endpoint, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('access_token')}`
            }
        });
        
        if (!response.ok) {
            throw new Error(`Failed to fetch ${type} data`);
        }
        
        return response.json();
    }

    updateCharts(stocks, crypto) {
        // Update stock charts
        Object.entries(stocks).forEach(([symbol, data]) => {
            if (!this.charts[symbol]) {
                this.initChart(symbol, data.currency);
            }
            this.updateChart(symbol, data);
        });

        // Update crypto charts
        Object.entries(crypto).forEach(([coin, data]) => {
            if (!this.charts[coin]) {
                this.initChart(coin, data.currency);
            }
            this.updateChart(coin, data);
        });
    }

    initChart(symbol, currency) {
        const ctx = document.createElement('canvas');
        ctx.dataset.symbol = symbol;
        document.getElementById('chartContainer').appendChild(ctx);
        
        this.charts[symbol] = new Chart(ctx, {
            type: 'line',
            options: {
                responsive: true,
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        callbacks: {
                            label: (context) => 
                                `${currency} ${context.parsed.y.toFixed(2)}`
                        }
                    }
                }
            }
        });
    }

    updateChart(symbol, data) {
        const chart = this.charts[symbol];
        chart.data = {
            labels: data.historical.map(d => d.date),
            datasets: [{
                data: data.historical.map(d => d.close),
                borderColor: '#2962ff',
                tension: 0.4,
                fill: true,
                backgroundColor: 'rgba(41, 98, 255, 0.05)'
            }]
        };
        chart.update();
    }

    updatePriceDisplays(stocks, crypto) {
        this.updatePriceCard('stocks', stocks);
        this.updatePriceCard('crypto', crypto);
    }

    updatePriceCard(type, data) {
        const container = document.getElementById(`${type}Cards`);
        container.innerHTML = '';
        
        Object.entries(data).forEach(([symbol, info]) => {
            const changeClass = info.change_percent >= 0 ? 'text-success' : 'text-danger';
            const card = `
                <div class="col-md-4 mb-4">
                <h1>CHARTS</h1>
                    <div class="card h-100 shadow-sm">
                        <div class="card-body">
                            <h5 class="card-title">${symbol}</h5>
                            <h2 class="card-text ${changeClass}">
                                ${info.currency} ${info.current_price.toFixed(2)}
                                <small class="fs-6">(${info.change_percent.toFixed(2)}%)</small>
                            </h2>
                            <div class="row mt-3">
                                <div class="col-6">
                                    <small class="text-muted">Open</small>
                                    <div>${info.currency} ${info.historical[0].open.toFixed(2)}</div>
                                </div>
                                <div class="col-6">
                                    <small class="text-muted">Volume</small>
                                    <div>${this.formatVolume(info.historical[0].volume)}</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            container.innerHTML += card;
        });
    }

    formatVolume(volume) {
        if (volume >= 1e9) return `${(volume / 1e9).toFixed(1)}B`;
        if (volume >= 1e6) return `${(volume / 1e6).toFixed(1)}M`;
        return volume.toLocaleString();
    }

    showError(message) {
        const errorDiv = document.getElementById('errorMessage');
        errorDiv.textContent = message;
        errorDiv.classList.remove('d-none');
        setTimeout(() => errorDiv.classList.add('d-none'), 5000);
    }
}

// Initialize when dashboard loads
document.addEventListener('DOMContentLoaded', () => { 
    if (document.getElementById('chartContainer')) {
        
        new FinancialDataHandler();
    }
});