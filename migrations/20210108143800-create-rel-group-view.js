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
      view_id: {
        type: Sequelize.INTEGER,
        references: {
          model: {
            schema: 'terrama2',
            tableName: 'views'
          },
          key: 'id'
        },
        onDelete: 'SET NULL',
        allowNull: true
      },
      group_id: {
        type: Sequelize.INTEGER,
        references: {
          model: {
            tableName: 'groups',
            schema: 'terrama2'
          },
          key: 'id'
        },
        onDelete: 'CASCADE',
        allowNull: false,
      },
    }, {
      charset: 'utf-8',
      schema: 'terrama2'
    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable({schema: 'terrama2', tableName: 'rel_group_views'});
  }
};
