'use strict';
const {Model} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class ConservationUnit extends Model {
    static associate(models) {
    }
  }

  // const ConservationUnit = sequelize.define('de_unidade_cons_sema',
  ConservationUnit.init({
    gid: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    id: {
      type: DataTypes.FLOAT,
      allowNull: false
    },
    areaM2: {
      field: 'area__m2_',
      type: DataTypes.FLOAT,
      allowNull: false
    },
    objectid: {
      type: DataTypes.FLOAT,
      allowNull: false
    },
    geom: {
      type: DataTypes.DOUBLE,
      allowNull: false
    },
    codigoUc: {
      field: 'codigo_uc',
      type: DataTypes.STRING,
      allowNull: false
    },
    name: {
      field: 'nome',
      type: DataTypes.STRING,
      allowNull: false
    },
    jurisdica1: {
      type: DataTypes.STRING,
      allowNull: false
    },
    atoLegal: {
      type: DataTypes.STRING,
      allowNull: false
    },
    origem: {
      type: DataTypes.STRING,
      allowNull: false
    },
    grupo: {
      type: DataTypes.STRING,
      allowNull: false
    },
    areaOficial: {
      field: 'area_ofic1',
      type: DataTypes.STRING,
      allowNull: false
    },
    categoria: {
      type: DataTypes.STRING,
      allowNull: false
    },
    planoMan1: {
      type: DataTypes.STRING,
      allowNull: false
    },
    versao: {
      type: DataTypes.STRING,
      allowNull: false
    },
    operador: {
      type: DataTypes.STRING,
      allowNull: false
    },
    shapeLen: {
      type: DataTypes.DOUBLE,
      allowNull: false
    },
    shapeAre1: {
      type: DataTypes.DOUBLE,
      allowNull: false
    },
    areaCalc1: {
      type: DataTypes.DOUBLE,
      allowNull: false
    },
    date: {
      field: 'data_cada1',
      type: DataTypes.DATE,
      allowNull: false
    }
  }, {
    sequelize,
    schema: 'public',
    tableName: 'de_unidade_cons_sema',
    modelName: 'ConservationUnit',
    underscored: true,
    // underscoredAll: true,
    timestamps: false,
    freezeTableName: true
  });
  return ConservationUnit
}
