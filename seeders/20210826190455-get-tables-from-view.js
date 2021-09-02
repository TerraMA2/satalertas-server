'use strict';
const oldQuery = `INSERT INTO terrama2.infocolumn_table_list (table_name, type)
SELECT dsf.value AS "table_name", 'view' AS "type"
FROM terrama2.data_set_formats AS dsf
WHERE dsf.key = 'table_name'
ORDER BY "table_name";`;

const newQueryInsert = `INSERT INTO terrama2.infocolumn_table_list (table_name, type)
SELECT DISTINCT
(CASE
  WHEN vw.source_type = 3 THEN concat(TRIM(dsf.value), '_', analysis.id)
  ELSE dsf.value
  END) AS table_name, 'view' AS "type"
FROM terrama2.views AS vw
INNER JOIN terrama2.data_sets AS dst ON (vw.data_series_id = dst.data_series_id)
INNER JOIN terrama2.data_set_formats AS dsf ON (dst.id = dsf.data_set_id)
LEFT JOIN terrama2.analysis AS analysis ON dsf.data_set_id = analysis.dataset_output
WHERE dsf.key = 'table_name'
ORDER BY "table_name";`

const truncateQuery = 'TRUNCATE terrama2.infocolumn_table_list RESTART IDENTITY CASCADE;'

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.sequelize.query(newQueryInsert),
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    return await queryInterface.sequelize.query(truncateQuery);
  },
};
