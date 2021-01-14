'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('rel_group_views', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.UUID
      },
      id_view: {
        type: Sequelize.INTEGER
      },
      created_at: Sequelize.DATE,
      updated_at: Sequelize.DATE
    }, {
      charset: 'utf-8',
      schema: 'terrama2'
    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('rel_group_views',
    {
      schema: 'terrama2'
    });
  }
};
