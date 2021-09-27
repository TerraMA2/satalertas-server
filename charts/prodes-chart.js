const Chart = require('./chart.model');

function chartBase64(params) {
  const newChart = new Chart();
  newChart.setConfig(params);
  newChart.setWidth(600)
  newChart.setHeight(250)
  return newChart.toDataUrl();
}

getChartOptions = async (labels, data) => {
  return {
    type: 'line',
    data: {
      labels: labels,
      datasets: [
        {
          label: 'NDVI',
          data: data,
          backgroundColor: 'rgba(17,17,177,0)',
          borderColor: 'rgba(5,177,0,1)',
          showLine: true,
          borderWidth: 2,
          pointRadius: 0,
        },
      ],
    },
    options: {
      responsive: false,
      plugins: {
        legend: {
          display: false,
        },
      },
    },
  };
};

module.exports = {
  getChartOptions,
  chartBase64,
};
