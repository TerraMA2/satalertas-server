'use strict';

const sqlInsert = `INSERT INTO terrama2.infocolumn_columns_list (
  table_id, column_name, primary_type, alias, column_position
)
SELECT
itl.id,
    cols.column_name,
    (CASE WHEN cols.data_type = 'USER-DEFINED'
      THEN cols.udt_name
      WHEN cols.data_type = 'character varying'
      THEN 'string'
      ELSE cols.data_type
    END) AS "type_name",
    cols.column_name,
    cols.ordinal_position
FROM terrama2.infocolumn_table_list AS itl
INNER JOIN information_schema.columns AS cols ON (itl.table_name = cols.table_name)
ORDER BY itl.table_name, cols.ordinal_position, cols.column_name;`
const sqlUpdate = `UPDATE terrama2.infocolumn_columns_list
SET secondary_type = 'car_area'
WHERE alias like '%de_car_validado_sema_area_ha_'`

module.exports = {
  up: async (queryInterface, _Sequelize) => {
    return Promise.all([
      queryInterface.sequelize.query(sqlInsert),
      queryInterface.sequelize.query(sqlUpdate)
    ])
  },

  down: async (queryInterface, _Sequelize) => {
    return await queryInterface.sequelize.query(
      'TRUNCATE terrama2.infocolumn_columns_list RESTART IDENTITY CASCADE;'
    )
  }
};
