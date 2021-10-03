'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable(
        'reports',
        {
          id: {
            allowNull: false,
            autoIncrement: true,
            primaryKey: true,
            type: Sequelize.INTEGER,
          },
          code: {
            allowNull: false,
            type: Sequelize.INTEGER,
          },
          car_code: {
            type: Sequelize.STRING,
            allowNull: false,
          },
          car_gid: {
            type: Sequelize.INTEGER,
            allowNull: false,
          },
          name: {
            type: Sequelize.STRING,
            allowNull: false,
          },
          path: {
            allowNull: false,
            type: Sequelize.STRING,
          },
          type: {
            allowNull: false,
            type: Sequelize.STRING,
          },
          created_at: Sequelize.DATE,
          updated_at: Sequelize.DATE,
        },
        {
          charset: 'utf-8',
          schema: 'alertas',
        },
    );
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable({
      tableName: 'reports',
      schema: 'alertas',
    });
  },
};
