// static/script.js
let currentCharts = [];

function renderFinancialData(data, containerId, isCrypto = false) {
    const container = document.getElementById(containerId);
    container.innerHTML = '';
    currentCharts.forEach(chart => chart.destroy());
    currentCharts = [];

    Object.entries(data).forEach(([symbol, stockData]) => {
        const card = document.createElement('div');
        card.className = 'col-md-6 col-xl-4 mb-4';
        card.innerHTML = `
            <div class="card h-100">
                <div class="card-body">
                    <div class="d-flex justify-content-between align-items-center mb-3">
                        <h5 class="card-title">${symbol}</h5>
                        <span class="badge bg-${isCrypto ? 'warning' : 'primary'}">${isCrypto ? 'CRYPTO' : 'STOCK'}</span>
                    </div>
                    <h2 class="card-text ${stockData.current.change >= 0 ? 'text-success' : 'text-danger'}">
                        $${stockData.current.price.toFixed(2)}
                        <small class="fs-6">(${stockData.current.change_percent.toFixed(2)}%)</small>
                    </h2>
                    <canvas class="mt-3" height="120"></canvas>
                </div>
            </div>
        `;

        container.appendChild(card);
        const canvas = card.querySelector('canvas');
        renderChart(canvas, stockData.historical);
    });
}

function renderChart(canvas, historicalData) {
    const chart = new Chart(canvas, {
        type: 'line',
        data: {
            labels: historicalData.map(d => d.date),
            datasets: [{
                data: historicalData.map(d => d.price),
                borderColor: '#2962ff',
                backgroundColor: 'rgba(41, 98, 255, 0.05)',
                fill: true,
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: { display: false },
                tooltip: {
                    mode: 'index',
                    intersect: false
                }
            },
            scales: {
                x: { display: false },
                y: { display: false }
            }
        }
    });
    currentCharts.push(chart);
}

// Stock Data Handling
function loadData(period = '1d') {
    fetch(`http://localhost:5000/api/stocks/${period}`)
        .then(response => response.json())
        .then(data => renderFinancialData(data, 'stocksContent'));
}

// Crypto Data Handling
function loadCryptoData(period = '1d') {
    fetch(`http://localhost:5000/api/crypto/${period}`)
        .then(response => response.json())
        .then(data => renderFinancialData(data, 'cryptoContent', true));
}

// Initial Load
document.addEventListener('DOMContentLoaded', () => {
    loadData();
    document.getElementById('dashboardTabs').addEventListener('shown.bs.tab', event => {
        if (event.target.hash === '#crypto') loadCryptoData();
    });
});

