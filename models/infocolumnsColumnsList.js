'use strict';
const {Model} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    const {models} = sequelize;

    class InfocolumnColumnsList extends Model {
        static associate(models) {
            const {InfocolumnsTableList} = models;
            this.belongsTo(InfocolumnsTableList, {
                foreignKey: {
                    onDelete: 'NO ACTION',
                    allowNull: true,
                    name: "table_id"
                },
            });
        }
    }

    InfocolumnColumnsList.init(
        {
            id: {
                type: DataTypes.BIGINT,
                allowNull: false,
                primaryKey: true,
                autoIncrement: true,
            },
            tableId: DataTypes.BIGINT,
            columnName: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            alias: DataTypes.STRING,
            primaryType: {
                type: DataTypes.STRING,
            },
            secondaryType: {
                type: DataTypes.STRING,
            },
            disableEditing: {
                type: DataTypes.BOOLEAN,
                allowNull: false,
                defaultValue: false,
            },
            hide: {
                type: DataTypes.BOOLEAN,
                allowNull: false,
                defaultValue: true,
            },
            columnPosition: DataTypes.INTEGER,
            description: DataTypes.STRING,
        },
        {
            sequelize,
            modelName: 'InfocolumnColumnsList',
            tableName: 'infocolumn_columns_list',
            schema: 'terrama2',
            underscored: true,
            timestamps: false,
        },
    );
    return InfocolumnColumnsList;
};
