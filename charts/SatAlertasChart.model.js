const QuickChart = require('quickchart-js');
const { chartPath } = require('../config/config.json');

class SatAlertasChart extends QuickChart {
  constructor() {
    super();
    this.host = chartPath.host;
    this.protocol = chartPath.protocol;
    this.baseUrl = `${this.protocol}://${this.host}`;
    this.width = 480;
    this.height = 200;
    this.version = 3;
  }
}

module.exports = SatAlertasChart
