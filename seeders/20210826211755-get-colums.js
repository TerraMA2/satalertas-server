'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return await queryInterface.sequelize.query(
      `INSERT INTO terrama2.infocolumn_columns_list (table_id, column_name, primary_type, alias)
      SELECT itl.id,
        cols.column_name,
        (CASE WHEN cols.data_type = 'USER-DEFINED'
          THEN cols.udt_name
          ELSE cols.data_type
        END) AS "type_name",
        cols.column_name
      FROM terrama2.views AS vw
      INNER JOIN terrama2.data_sets AS dst ON (vw.data_series_id = dst.data_series_id)
      INNER JOIN terrama2.data_set_formats AS dsf ON (dst.id = dsf.data_set_id)
      INNER JOIN information_schema.columns AS cols ON (dsf.value = cols.table_name)
      INNER JOIN terrama2.infocolumn_table_list AS itl ON (dsf.value = itl.table_name)
      WHERE dsf.key = 'table_name';`
    )
  },

  down: async (queryInterface, Sequelize) => {
    return await queryInterface.sequelize.query(
      'TRUNCATE terrama2.infocolumn_columns_list RESTART IDENTITY CASCADE;'
    )
  }
};
