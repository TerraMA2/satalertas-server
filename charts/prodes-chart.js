const Chart = require('./chart.model');

function chartBase64(params) {

  const newChart = new Chart();
  newChart.setConfig(params)
  console.log("chartUrl: ", newChart.getUrl())
  return newChart;
  
}

module.exports = {
  chartBase64
}
