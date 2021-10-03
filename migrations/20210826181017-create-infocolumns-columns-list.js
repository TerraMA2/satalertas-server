'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable(
        'infocolumn_columns_list',
        {
          id: {
            allowNull: false,
            autoIncrement: true,
            primaryKey: true,
            type: Sequelize.INTEGER,
          },
          table_id: {
            type: Sequelize.INTEGER,
            references: {
              model: {
                schema: 'terrama2',
                tableName: 'infocolumn_table_list',
              },
              key: 'id',
            },
            onDelete: 'SET NULL',
            comment: 'Id from table list'
          },
          column_name: {
            type: Sequelize.STRING,
            allowNull: false,
            comment: 'Field name at database',
          },
          alias: {
            type: Sequelize.STRING,
            comment: 'Name to show',
          },
          primary_type: {
            type: Sequelize.STRING,
            comment: 'Field type at database',
          },
          secondary_type: {
            type: Sequelize.STRING,
            comment: 'Field type by user',
          },
          disable_editing: {
            type: Sequelize.BOOLEAN,
            allowNull: false,
            defaultValue: false,
            comment: 'Enable or Disable edition',
          },
          hide: {
            type: Sequelize.BOOLEAN,
            allowNull: false,
            defaultValue: true,
            comment: 'Hide field',
          },
          column_position: {
            type: Sequelize.INTEGER,
            comment: "Column position at table"
          },
          description: {
            type: Sequelize.STRING,
            comment: 'Field description',
          },
        },
        {
          charset: 'utf-8',
          tableName: 'infocolumn_columns_list',
          schema: 'terrama2',
          comment: 'Columns informations',
        },
    );
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable({
      schema: 'terrama2',
      tableName: 'infocolumn_columns_list',
    });
  },
};
