'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    /*
      Add altering commands here.
      Return a promise to correctly handle asynchronicity.

      Example:
      return queryInterface.createTable('users', { id: Sequelize.INTEGER });
    */
    return Promise.all([
      queryInterface.changeColumn({schema: 'terrama2', tableName: 'rel_group_views'}, 'view_id', {
        type: Sequelize.INTEGER,
        onDelete: 'SET NULL'
      }),
      queryInterface.changeColumn({schema: 'terrama2', tableName: 'rel_group_views'}, 'group_id', {
        type: Sequelize.INTEGER,
        onDelete: 'CASCADE'
      })
    ])
  },

  down: (queryInterface, Sequelize) => {
    /*
      Add reverting commands here.
      Return a promise to correctly handle asynchronicity.

      Example:
      return queryInterface.dropTable('users');
    */
    return Promise.all([
      queryInterface.changeColumn({schema: 'terrama2', tableName: 'rel_group_views'}, 'view_id', {
        type: Sequelize.INTEGER,
        onDelete: 'NO ACTION'
      }),
      queryInterface.changeColumn({schema: 'terrama2', tableName: 'rel_group_views'}, 'group_id', {
        type: Sequelize.INTEGER,
        onDelete: 'NO ACTION'
      })
    ])
  },
};
