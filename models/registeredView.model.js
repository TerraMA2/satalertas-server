'use strict';
const {Model} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class RegisteredView extends Model {
    static associate(models) {
      this.belongsTo(models.View, {
        onDelete: 'CASCADE',
        foreignKey: 'view_id',
        as: 'view',
      });
    }
  }

  RegisteredView.init(
      {
        id: {
          type: DataTypes.INTEGER,
          allowNull: false,
          primaryKey: true,
          autoIncrement: true,
        },
        workspace: {
          type: DataTypes.STRING,
          allowNull: false,
          comment: 'Map server workspace',
        },
        uri: {
          type: DataTypes.STRING,
          allowNull: false,
          comment: 'Map server URI',
        },
      },
      {
        sequelize,
        schema: 'terrama2',
        tableName: 'registered_views',
        modelName: 'RegisteredView',
        underscored: true,
        underscoredAll: true,
        timestamps: false,
      },
  );
  return RegisteredView;
};
