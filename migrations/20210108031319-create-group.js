'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('groups', {
          id: {
            allowNull: false,
            autoIncrement: true,
            primaryKey: true,
            type: Sequelize.INTEGER
          },
          project_id: {
            type: Sequelize.INTEGER
          },
          name: {
            type: Sequelize.STRING
          },
          code: {
            type: Sequelize.STRING
          },
          active_area: {
            type: Sequelize.BOOLEAN
          },
          dashboard: {
            type: Sequelize.BOOLEAN
          }
        },
        {
          charset: 'utf-8',
          schema: 'terrama2'
        });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable({schema: 'terrama2', tableName: 'groups'});
  }
};
