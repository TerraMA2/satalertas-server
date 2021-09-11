'use strict';
const {Model} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class SecondaryTypes extends Model {
        static associate(models) {
        }
    }

    SecondaryTypes.init(
        {
            id: {
                type: DataTypes.BIGINT,
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
            },
            type: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            label: DataTypes.STRING,
            description: DataTypes.STRING,
        },
        {
            sequelize,
            schema: 'terrama2',
            tableName: 'secondary_types',
            modelName: 'SecondaryTypes',
            underscored: true,
            timestamps: false,
            freezeTableName: true,
        },
    );
    return SecondaryTypes;
};
