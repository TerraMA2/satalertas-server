'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class DataSetFormat extends Model {
    static associate(models) {
      this.belongsTo(models.DataSet, {
        as: 'dataSet',
        onDelete: 'CASCADE',
        foreignKey: {
          allowNull: false,
        },
      });
    }
  }
  DataSetFormat.init(
    {
      id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
      },
      key: DataTypes.STRING,
      value: DataTypes.TEXT,
    },
    {
      sequelize,
      tableName: 'data_set_formats',
      schema: 'terrama2',
      modelName: 'DataSetFormat',
      underscored: true,
      // underscoredAll: true,
      timestamps: false,
    },
  );

  return DataSetFormat;
};
