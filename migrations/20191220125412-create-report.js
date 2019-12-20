'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('reports', {
        id: {
          allowNull: false,
          autoIncrement: true,
          primaryKey: true,
          type: Sequelize.INTEGER
        },
        name: {
          type: Sequelize.STRING,
          allowNull: false

        },
        path: {
          allowNull: false,
          type: Sequelize.STRING
        },
        created_at: Sequelize.TIME,
        updated_at: Sequelize.DATE
      },
      {
        charset: 'utf-8',
        schema: 'terrama2-alert'
      })
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('reports',
      {
        schema: 'terrama2-alert'
      })
  }
};
