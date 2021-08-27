'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return await queryInterface.sequelize.query(
      `INSERT INTO terrama2.infocolumn_table_list (table_name, view_id, type)
  SELECT dsf.value, vw.id, 'view'
  FROM terrama2.views AS vw
  INNER JOIN terrama2.data_sets AS dst ON (vw.data_series_id = dst.data_series_id)
  INNER JOIN terrama2.data_set_formats AS dsf ON (dst.id = dsf.data_set_id)
  WHERE dsf.key = 'table_name';`
    )
  },

  down: async (queryInterface, Sequelize) => {
    return await queryInterface.sequelize.query(
      'TRUNCATE terrama2.infocolumn_table_list RESTART IDENTITY CASCADE;'
    )
  }
};
