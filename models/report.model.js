'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Report extends Model {}

  Report.init(
    {
      id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
        comment: 'Report file name',
      },
      code: {
        type: DataTypes.STRING,
        allowNull: false,
        comment: 'Report code',
      },
      carCode: {
        type: DataTypes.STRING,
        allowNull: false,
        comment: 'Code of the CAR',
      },
      carGid: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: 'GID of the table CAR',
      },
      path: {
        type: DataTypes.STRING,
        allowNull: false,
        comment: 'Report file path',
      },
      type: {
        type: DataTypes.STRING,
        allowNull: false,
        comment: 'Report of the report - DETER, PRODES, QUEIMADA',
      },
    },
    {
      sequelize,
      schema: 'alertas',
      modelName: 'Report',
      underscored: true,
      // underscoredAll: true,
      timestamps: true,
    },
  );

  return Report;
};
