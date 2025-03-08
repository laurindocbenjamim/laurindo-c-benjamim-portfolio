// js/app.js
import { fetchData, fetchData_from_json, fetchDataFromKaggleHubAPI, fetchCSVData } from './data.js';
import { renderLineChart, renderBarChart, renderPieChart } from './charts.js';
import { updateKPIs, setupFilters, setupExport, setupAutoRefresh, setupRefresh } from './ui.js';

let salesData = [];

async function init() {
  try {
    salesData = await fetchData();
    updateKPIs(salesData);
    renderLineChart(salesData);
    renderBarChart(salesData);
    renderPieChart(salesData);
    setupFilters(salesData);
    setupExport(salesData);
    setupRefresh();
    setupAutoRefresh();
  } catch (error) {
    console.error("Error initializing dashboard:", error);
  }
}

init();
