const QuickChart = require('quickchart-js');
const env = process.env.NODE_ENV || 'development';
const { chartPath } = require('../config/config.json')[env];

class SatAlertasChart extends QuickChart {
  constructor() {
    super();
    this.host = chartPath.host;
    this.protocol = chartPath.protocol;
    this.baseUrl = `${this.protocol}://${this.host}`;
    this.width = 480;
    this.height = 200;
  }
}

module.exports = SatAlertasChart
