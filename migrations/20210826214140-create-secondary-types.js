'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable(
      'secondary_types',
      {
        id: {
          allowNull: false,
          autoIncrement: true,
          primaryKey: true,
          type: Sequelize.INTEGER,
        },
        type: {
          type: Sequelize.STRING,
          comment: 'type name',
          allowNull: false,
        },
        label: {
          type: Sequelize.STRING,
          comment: 'User Friendly name'
        },
        description: {
          type: Sequelize.STRING,
          comment: 'Type description'
        },
      },
      {
        charset: 'utf-8',
        tableName: 'secondary_types',
        schema: 'terrama2',
        comment: 'Secondary column type to infocolumn',
        freezeTableName: true,
      },
    );
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable({
      schema: 'terrama2',
      tableName: 'secondary_types',
    });
  },
};
