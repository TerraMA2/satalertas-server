"use strict";
module.exports = (sequelize, DataTypes) => {
  const DataSeries = sequelize.define("DataSeries", {
      id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true
      },
      name: {
        type: DataTypes.STRING
      },
      description: DataTypes.TEXT,
      active: DataTypes.BOOLEAN
    },
    {
      tableName: 'data_series',
      schema: 'terrama2',
      indexes: [
        {
          unique: true,
          fields: ['project_id', 'name']
        }
      ],
      underscored: true,
      underscoredAll: true,
      timestamps: false,
    }
  );
  DataSeries.associate = function(models) {
      DataSeries.belongsTo(models.Project, {
        onDelete: "CASCADE",
        foreignKey: {
          name: "project_id",
          allowNull: false
        }
      });

      DataSeries.hasMany(models.DataSet, {
        onDelete: "CASCADE",
        as: "dataSet",
        foreignKey: {
          name: "data_series_id",
          allowNull: false
        }
      });

      DataSeries.hasOne(models.View, {
        onDelete: "CASCADE",
        foreignKey: {
          name: "data_series_id",
          allowNull: false
        }
      });
    }

  return DataSeries;
};
