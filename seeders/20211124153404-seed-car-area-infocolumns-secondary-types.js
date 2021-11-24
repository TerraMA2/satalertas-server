"use strict";

const sqlUp = `UPDATE terrama2.infocolumn_columns_list
  SET secondary_type = 'car_area'
WHERE
  column_name LIKE '%de_car_validado_sema_area_ha_'
  AND secondary_type IS NULL;`;

const sqlDown = `  UPDATE terrama2.infocolumn_columns_list
    SET secondary_type = NULL
  WHERE
    column_name LIKE '%de_car_validado_sema_area_ha_';`;
module.exports = {
  up: async (queryInterface, Sequelize) => {
    return Promise.all([queryInterface.sequelize.query(sqlUp)]);
  },

  down: async (queryInterface, Sequelize) => {
    return Promise.all([queryInterface.sequelize.query(sqlDown)]);
  },
};
