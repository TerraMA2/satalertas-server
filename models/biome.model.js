'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Biome extends Model {
    static associate(models) {}
  }

  Biome.init(
    {
      gid: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
      },
      gidOther: {
        field: '__gid',
        type: DataTypes.DOUBLE,
        allowNull: false,
      },
      geom: {
        type: DataTypes.DOUBLE,
        allowNull: false,
      },
      name: {
        field: 'bioma',
        type: DataTypes.STRING,
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: 'Biome',
      schema: 'public',
      tableName: 'de_biomas_mt',
      underscored: true,
      // underscoredAll: true,
      timestamps: false,
      // freezeTableName: true,
    },
  );
  return Biome;
};
