"use strict";

const columnName = "de_car_validado_sema_numero_do1";
const sqlUp = `UPDATE terrama2.infocolumn_columns_list
  SET secondary_type = 'federal_car'
WHERE
  column_name LIKE '%${columnName}'
  AND secondary_type IS NULL;`;

const columnNameState = "de_car_validado_sema_numero_do2";
const sqlUpState = `UPDATE terrama2.infocolumn_columns_list
  SET secondary_type = 'state_car'
WHERE
  column_name LIKE '%${columnNameState}'
  AND secondary_type IS NULL;`;

const sqlDown = `UPDATE terrama2.infocolumn_columns_list
  SET secondary_type = Null
WHERE
  column_name LIKE '%${columnName}';`;

const sqlDownState = `UPDATE terrama2.infocolumn_columns_list
  SET secondary_type = NULL
WHERE
  column_name LIKE '%${columnNameState}';`;

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.sequelize.query(sqlUp),
      queryInterface.sequelize.query(sqlUpState),
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.sequelize.query(sqlDown),
      queryInterface.sequelize.query(sqlDownState),
    ]);
  },
};
