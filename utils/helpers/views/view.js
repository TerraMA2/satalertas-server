const deter = require('./deter');
const prodes = require('./prodes');
const burned = require('./burned');
const burned_area = require('./burned-area');
const static_data = require('./static-data');
const dynamic_data = require('./dynamic-data');

const VIEWS = {
  DETER: deter,
  PRODES: prodes,
  BURNED: burned,
  BURNED_AREA: burned_area,
  STATIC_DATA: static_data,
  DYNAMIC_DATA: dynamic_data
};

module.exports = VIEWS;
