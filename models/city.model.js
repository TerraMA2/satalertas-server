'use strict';
const {Model} = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class City extends Model {
        static associate(models) {
        }
    }

    City.init({
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
        idMunic: {
            type: DataTypes.FLOAT,
            allowNull: false
        },
        geometria: {
            type: DataTypes.FLOAT,
            allowNull: false
        },
        geom: {
            type: DataTypes.DOUBLE,
            allowNull: false
        },
        unidadeD1: {
            field: 'municipio',
            type: DataTypes.STRING,
            allowNull: false
        },
        licenciam1: {
            type: DataTypes.STRING,
            allowNull: false
        },
        contato: {
            type: DataTypes.STRING,
            allowNull: false
        },
        municipio: {
            type: DataTypes.STRING,
            allowNull: false
        },
        geocodigo: {
            type: DataTypes.STRING,
            allowNull: false
        },
        comarca: {
            type: DataTypes.STRING,
            allowNull: false
        },
        entrancia: {
            type: DataTypes.STRING,
            allowNull: false
        },
        nmMicro: {
            type: DataTypes.STRING,
            allowNull: false
        },
        cdGeocmi: {
            type: DataTypes.STRING,
            allowNull: false
        },
        nmMeso: {
            type: DataTypes.STRING,
            allowNull: false
        },
        cdGeocme: {
            type: DataTypes.STRING,
            allowNull: false
        }
    }, {
        modelName: 'City',
        schema: 'public',
        tableName: 'de_municipios_sema',
        underscored: true,
        // underscoredAll: true,
        timestamps: false,
        freezeTableName: true,
        sequelize
    });

    return City
}
