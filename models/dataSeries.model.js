'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class DataSeries extends Model {
    static associate(models) {
      const { DataSet, Project, View} = models;
      this.belongsTo(Project, {
        onDelete: 'CASCADE',
        foreignKey: {
          name: 'project_id',
          allowNull: false,
        },
      });

      this.hasMany(DataSet, {
        onDelete: 'CASCADE',
        as: 'dataSet',
        foreignKey: {
          name: 'data_series_id',
          allowNull: false,
        },
      });

      this.hasOne(View, {
        onDelete: 'CASCADE',
        foreignKey: {
          name: 'data_series_id',
          allowNull: false,
        },
      });
    }
  }

  DataSeries.init(
    {
      id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
      },
      name: {
        type: DataTypes.STRING,
      },
      description: DataTypes.TEXT,
      active: DataTypes.BOOLEAN,
    },
    {
      sequelize,
      tableName: 'data_series',
      schema: 'terrama2',
      modelName: 'DataSeries',
      indexes: [
        {
          unique: true,
          fields: ['project_id', 'name'],
        },
      ],
      underscored: true,
      // underscoredAll: true,
      timestamps: false,
    },
  );

  return DataSeries;
};
