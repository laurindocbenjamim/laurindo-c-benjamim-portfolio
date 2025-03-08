// js/ui.js
import { renderLineChart, renderBarChart, renderPieChart } from './charts.js';

export function updateKPIs(data) {
  
  getMinMaxYear(data)
  const totalRevenue = data.reduce((acc, curr) => acc + curr.revenue, 0);
  const ytdProfit = data.reduce((acc, curr) => acc + curr.profit, 0);
  const avgMonthlySales = totalRevenue / 12;

  // Determine top-selling product category by revenue
  const categoryTotals = {};
  data.forEach(item => {
    categoryTotals[item.category] = (categoryTotals[item.category] || 0) + item.revenue;
  });
  const topCategory = Object.keys(categoryTotals)
    .reduce((a, b) => categoryTotals[a] > categoryTotals[b] ? a : b, '');

  
  document.getElementById('totalRevenue').textContent = `$${totalRevenue.toLocaleString()}`;
  document.getElementById('ytdProfit').textContent = `$${ytdProfit.toLocaleString()}`;
  document.getElementById('avgMonthlySales').textContent = `$${Math.round(avgMonthlySales).toLocaleString()}`;
  document.getElementById('topCategory').textContent = topCategory;
}

export function setupFilters(data) {
  document.querySelectorAll('.filter-year').forEach(item => {
    item.addEventListener('click', e => { 
      const year = e.target.dataset.year;
      document.getElementById('yearRevenue').textContent =`${year}`;
      applyFilters({ year }, data);
    });
  });
  document.querySelectorAll('.filter-region').forEach(item => {
    item.addEventListener('click', e => {
      const region = e.target.dataset.region;
      applyFilters({ region }, data);
    });
  });
  document.querySelectorAll('.filter-category').forEach(item => {
    item.addEventListener('click', e => {
      const category = e.target.dataset.category;
      applyFilters({ category }, data);
    });
  });
}

function applyFilters(filterOptions, data) {
  let filteredData = data;
  if (filterOptions.year) {
    filteredData = filteredData.filter(d => new Date(d.date).getFullYear() == filterOptions.year);
  }
  if (filterOptions.region) {
    filteredData = filteredData.filter(d => d.region === filterOptions.region);
  }
  if (filterOptions.category) {
    filteredData = filteredData.filter(d => d.category === filterOptions.category);
  }
  
  updateKPIs(filteredData);
  // Re-render all charts with the filtered data.
  renderLineChart(filteredData);
  renderBarChart(filteredData);
  renderPieChart(filteredData);
}

export function setupExport(data) {
  document.getElementById('exportBtn').addEventListener('click', () => {
    let csv = 'Date,Region,Category,Revenue,Profit\n';
    data.forEach(row => {
      csv += `${row.date},${row.region},${row.category},${row.revenue},${row.profit}\n`;
    });
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sales_data.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  });
}

export function setupAutoRefresh() {
  setInterval(() => {
    window.location.reload();
  }, 300000); // Refresh every 5 minutes
}

// New: Setup refresh button to manually reload data/charts.
export function setupRefresh() {
  document.getElementById('refreshBtn').addEventListener('click', () => {
    window.location.reload();
  });
}


function getMinMaxYear(data) {
  // Map the data to an array of years
  const years = data.map(item => new Date(item.date).getFullYear());
  // Calculate the minimum and maximum year
  const minYear = Math.min(...years);
  const maxYear = Math.max(...years);
  if (minYear && maxYear) {
    document.getElementById('yearRevenue').textContent = 
      minYear !== maxYear ? `${minYear} to ${maxYear}` : `${minYear}`;
  } else {
    document.getElementById('yearRevenue').textContent = "Year data unavailable";
  }
  
  
  return { minYear, maxYear };
}
