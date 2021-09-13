const deter = require('./deter');
const prodes = require('./prodes');
const burned = require('./burned');
const burned_area = require('./burned-area');
const static_data = require('./static-data');
const dynamic_data = require('./dynamic-data');
const newFilter = require('./filter/new_filter');

const VIEWS = {
    DETER: deter,
    PRODES: prodes,
    BURNED: burned,
    BURNED_AREA: burned_area,
    STATIC: static_data,
    DYNAMIC: dynamic_data,
    newFilter
};

module.exports = VIEWS;
