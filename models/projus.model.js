'use strict';
const {Model} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class Projus extends Model {
        static associate(models) {
        }
    }

    Projus.init(
        {
            gid: {
                type: DataTypes.INTEGER,
                allowNull: false,
                primaryKey: true,
                autoIncrement: true
            },
            fidPromot: {
                type: DataTypes.INTEGER,
                allowNull: false
            },
            shapeLeng: {
                type: DataTypes.DOUBLE,
                allowNull: false
            },
            areaKm: {
                field: 'area_km2',
                type: DataTypes.DOUBLE,
                allowNull: false
            },
            areaHa: {
                type: DataTypes.DOUBLE,
                allowNull: false
            },
            shapeLe: {
                field: 'shape_le_1',
                type: DataTypes.DOUBLE,
                allowNull: false
            },
            shapeArea: {
                type: DataTypes.DOUBLE,
                allowNull: false
            },
            geom: {
                type: DataTypes.DOUBLE,
                allowNull: false
            },
            promotoria: {
                type: DataTypes.STRING,
                allowNull: false
            },
            pjbh: {
                type: DataTypes.STRING,
                allowNull: false
            }
        }, {
            sequelize,
            schema: 'public',
            tableName: 'de_projus_bacias_sema',
            modelName: 'Projus',
            underscored: true,
            // underscoredAll: true,
            timestamps: false,
        });

    return Projus
}
