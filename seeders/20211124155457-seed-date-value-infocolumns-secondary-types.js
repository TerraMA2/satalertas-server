"use strict";

const columnName = "inpe_date";
const sqlUp = `UPDATE terrama2.infocolumn_columns_list
  SET secondary_type = 'date_value'
WHERE
  column_name LIKE '%${columnName}'
  AND secondary_type IS NULL;`;

const sqlDown = `UPDATE terrama2.infocolumn_columns_list
  SET secondary_type = NULL
WHERE
  column_name LIKE '%${columnName}';`;

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return Promise.all([queryInterface.sequelize.query(sqlUp)]);
  },

  down: async (queryInterface, Sequelize) => {
    return Promise.all([queryInterface.sequelize.query(sqlDown)]);
  },
};
