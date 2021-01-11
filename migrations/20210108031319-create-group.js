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
      id_project: {
        type: Sequelize.INTEGER
      },
      name: {
        type: Sequelize.STRING
      },
      code: {
        type: Sequelize.STRING
      },

      createdAt: Sequelize.DATE,
      updatedAt: Sequelize.DATE
    },  {
      charset: 'utf-8',
      schema: 'terrama2'
    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('groups',
    {
      schema: 'terrama2'
    });
  }
};
