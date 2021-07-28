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
      queryInterface.addColumn('rel_group_views', 'name', {
        type: Sequelize.STRING,
        allowNull: false,
        comment: 'View name',
      }),
      queryInterface.addColumn('rel_group_views', 'short_name', {
        type: Sequelize.STRING,
        allowNull: true,
        comment: 'Short name',
      }),
      queryInterface.addColumn('rel_group_views', 'description', {
        type: Sequelize.TEXT,
        comment: 'View description',
      }),
      queryInterface.addColumn('rel_group_views', 'active', {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        default: true,
        comment: 'It defines view can be used and retrieved. Default is true.',
      }),
      queryInterface.addColumn('rel_group_views', 'private', {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        default: false,
        comment: 'It defines if the view is private. Default is false.',
      }),
      queryInterface.addColumn('rel_group_views', 'schedule_type', {
        type: Sequelize.INTEGER,
        allowNull: true,
      }),
      queryInterface.addColumn('rel_group_views', 'source_type', {
        type: Sequelize.INTEGER,
        allowNull: false,
        comment:
          'It defines the type of data source that create the view. Alert, Analysis, Static Data or Dynamic Data',
      }),
      queryInterface.addColumn('rel_group_views', 'is_primary', {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        default: false,
        comment: 'It defines if the layer is parent or not. Default is false.',
      }),
      queryInterface.addColumn('rel_group_views', 'is_sublayer', {
        type: Sequelize.BOOLEAN,
        default: false,
        comment:
          'It defines if the layer is a sublayer or not. Default is false.',
      }),
      queryInterface.addColumn('rel_group_views', 'sub_layers', {
        type: Sequelize.ARRAY(Sequelize.INTEGER),
        allowNull: true,
        comment: 'It defines which layers are sub layers of this layer.',
      }),
    ]);
  },

  down: (queryInterface, Sequelize) => {
    /*
      Add reverting commands here.
      Return a promise to correctly handle asynchronicity.

      Example:
      return queryInterface.dropTable('users');
    */
    return Promise.all([
      queryInterface.removeColumn('rel_group_views', 'name'),
      queryInterface.removeColumn('rel_group_views', 'short_name'),
      queryInterface.removeColumn('rel_group_views', 'description'),
      queryInterface.removeColumn('rel_group_views', 'active'),
      queryInterface.removeColumn('rel_group_views', 'private'),
      queryInterface.removeColumn('rel_group_views', 'schedule_type'),
      queryInterface.removeColumn('rel_group_views', 'source_type'),
      queryInterface.removeColumn('rel_group_views', 'is_primary'),
      queryInterface.removeColumn('rel_group_views', 'is_sublayer'),
      queryInterface.removeColumn('rel_group_views', 'sub_layers'),
    ]);
  },
};
