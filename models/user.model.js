'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class User extends Model {
        static associate(models) {
            const { Project } = models;
            this.hasMany(Project, {
                onDelete: 'CASCADE',
                foreignKey: {
                    name: 'user_id',
                    allowNull: true,
                },
            });
        }
    }

    User.init(
        {
            id: {
                type: DataTypes.INTEGER,
                allowNull: false,
                primaryKey: true,
                autoIncrement: true
            },
            name: {
                type: DataTypes.STRING,
                allowNull: false
            },
            username: {
                type: DataTypes.STRING,
                allowNull: false,
                unique: true
            },
            password: {
                type: DataTypes.STRING,
                allowNull: false
            },
            salt: {
                type: DataTypes.STRING,
                allowNull: false
            },
            cellphone: {
                type: DataTypes.STRING,
                allowNull: false
            },
            email: {
                type: DataTypes.STRING,
                allowNull: false
            },
            administrator: {
                type: DataTypes.BOOLEAN,
                allowNull: false
            },
            token: {
                type: DataTypes.STRING,
                allowNull: false
            }
        },
        {
            sequelize,
            modelName: 'User',
            schema: 'terrama2',
            tableName: 'users',
            underscored: true,
            timestamps: false,
        },
    );
    return User;
};
