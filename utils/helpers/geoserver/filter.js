const FILTER_DEFAULT = require('./views.filter');
const FILTER_BURNED = require('./burned.filter');

module.exports = function(workspacekAlertas, dataStore, cod_view, tableOwner, tableName, isPrimary) {
  return {
    burned: FILTER_BURNED,
    default: FILTER_DEFAULT
  }
};
