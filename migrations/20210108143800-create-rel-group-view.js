'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('rel_group_views', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      id_view: {
        type: Sequelize.INTEGER
      },
    }, {
      charset: 'utf-8',
      schema: 'terrama2'
    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('rel_group_views');
  }
};
