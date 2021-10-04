'use strict';
const {Model} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class CarValidado extends Model {
    static associate(models) {
    }
  }

  CarValidado.init(
      {
        gid: {
          type: DataTypes.INTEGER,
          allowNull: false,
          primaryKey: true,
          autoIncrement: true
        },
        idFeicao: {
          type: DataTypes.DOUBLE,
          allowNull: false
        },
        areaHa_: {
          type: DataTypes.DOUBLE,
          allowNull: false
        },
        rid: {
          type: DataTypes.INTEGER,
          allowNull: false
        },
        migracaoI: {
          type: DataTypes.DOUBLE,
          allowNull: false
        },
        modulosFi: {
          type: DataTypes.DOUBLE,
          allowNull: false
        },
        percentual: {
          type: DataTypes.DOUBLE,
          allowNull: false
        },
        areaHaSema: {
          type: DataTypes.DOUBLE,
          allowNull: false
        },
        geom: {
          type: DataTypes.DOUBLE,
          allowNull: false
        },
        numeroDo1: {
          type: DataTypes.STRING,
          allowNull: false
        },
        numeroDo2: {
          type: DataTypes.STRING,
          allowNull: false
        },
        nomeDaP1: {
          type: DataTypes.STRING,
          allowNull: false
        },
        municipio1: {
          type: DataTypes.STRING,
          allowNull: false
        },
        situacao_1: {
          type: DataTypes.STRING,
          allowNull: false
        },
        nomepropri: {
          type: DataTypes.STRING,
          allowNull: false
        },
        cpfcnpj: {
          type: DataTypes.STRING,
          allowNull: false
        },
        origem: {
          type: DataTypes.STRING,
          allowNull: false
        },
        nomesProp: {
          type: DataTypes.STRING,
          allowNull: false
        },
        atividade: {
          type: DataTypes.STRING,
          allowNull: false
        },
        apfNumero: {
          type: DataTypes.STRING,
          allowNull: false
        },
        numeroArt: {
          type: DataTypes.STRING,
          allowNull: false
        },
        cruzaTerr: {
          type: DataTypes.STRING,
          allowNull: false
        },
        cruzaArea: {
          type: DataTypes.STRING,
          allowNull: false
        },
        geocodigo: {
          type: DataTypes.STRING,
          allowNull: false
        }
      }, {
        modelName: 'CarValidado',
        schema: 'public',
        tableName: 'de_car_validado_sema',
        underscored: true,
        // underscoredAll: true,
        timestamps: false,
        // freezeTableName: true,
        sequelize
      });

  return CarValidado
}
