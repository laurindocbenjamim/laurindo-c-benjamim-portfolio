// js/charts.js
let lineChartInstance = null;
let barChartInstance = null;
let pieChartInstance = null;

export function renderLineChart(data) {
  const ctx = document.getElementById('lineChart').getContext('2d');
  
  // Aggregate monthly sales from filtered data:
  const monthlyTotals = Array(12).fill(0);
  data.forEach(item => {
    const month = new Date(item.date).getMonth(); // 0-indexed month
    monthlyTotals[month] += item.revenue;
  });
  
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

  if (lineChartInstance) {
    lineChartInstance.destroy();
  }
  lineChartInstance = new Chart(ctx, {
    type: 'line',
    data: {
      labels: months,
      datasets: [{
        label: 'Monthly Sales',
        data: monthlyTotals,
        borderColor: 'rgba(75, 192, 192, 1)',
        fill: false,
      }]
    },
    options: {
      responsive: true,
      plugins: {
        tooltip: { enabled: true }
      }
    }
  });
}

export function renderBarChart(data) {
  const ctx = document.getElementById('barChart').getContext('2d');
  const regions = ['North', 'South', 'East', 'West'];
  const regionRevenue = regions.map(region =>
    data.filter(d => d.region === region).reduce((acc, curr) => acc + curr.revenue, 0)
  );

  if (barChartInstance) {
    barChartInstance.destroy();
  }
  barChartInstance = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: regions,
      datasets: [{
        label: 'Revenue by Region',
        data: regionRevenue,
        backgroundColor: 'rgba(153, 102, 255, 0.6)',
      }]
    },
    options: {
      responsive: true,
      plugins: { tooltip: { enabled: true } }
    }
  });
}

export function renderPieChart(data) {
  const ctx = document.getElementById('pieChart').getContext('2d');
  const categories = [...new Set(data.map(d => d.category))];
  const categoryProfits = categories.map(category =>
    data.filter(d => d.category === category).reduce((acc, curr) => acc + curr.profit, 0)
  );

  if (pieChartInstance) {
    pieChartInstance.destroy();
  }
  pieChartInstance = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: categories,
      datasets: [{
        label: 'Profit Distribution',
        data: categoryProfits,
        backgroundColor: [
          'rgba(255, 99, 132, 0.6)',
          'rgba(54, 162, 235, 0.6)',
          'rgba(255, 206, 86, 0.6)',
          'rgba(75, 192, 192, 0.6)'
        ],
      }]
    },
    options: {
      responsive: true,
      plugins: { tooltip: { enabled: true } }
    }
  });
}
