'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class InfocolumnsTableList extends Model {

    static associate(models) {
      const { InfocolumnColumnsList } = models;

      this.hasMany(InfocolumnColumnsList, {
        as: 'tableInfocolumns',
        onDelete: 'NO ACTION',
        foreignKey: {
          name: 'tableId'
        }
      })
    }
  };
  InfocolumnsTableList.init({
    id: {
      type: DataTypes.BIGINT,
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
    },
    tableName: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: 'Name of Table',
    },
    type: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: 'Table type, (view, report_list ...)',
    },
  }, {
    sequelize,
    schema: 'terrama2',
    tableName: 'infocolumn_table_list',
    modelName: 'InfocolumnsTableList',
    underscored: true,
    timestamps: false,
  });
  return InfocolumnsTableList;
};
