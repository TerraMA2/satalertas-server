'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    return await queryInterface.createTable(
      'infocolumn_table_list',
      {
        id: {
          allowNull: false,
          autoIncrement: true,
          primaryKey: true,
          type: Sequelize.INTEGER,
        },
        table_name: {
          type: Sequelize.STRING,
          comment: 'Name of Table',
        },
        type: {
          type: Sequelize.STRING,
          comment: 'Table type, (view, report_list ...)',
        },
      },
      {
        charset: 'utf-8',
        schema: 'terrama2',
        comment: 'List of tables'
      },
    );
  },
  down: async (queryInterface, Sequelize) => {
    return await queryInterface.dropTable({
      schema: 'terrama2',
      tableName: 'infocolumn_table_list',
    });
  },
};
