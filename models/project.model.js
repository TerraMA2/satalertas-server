'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Project extends Model {
    static associate(models) {
      const { DataSeries, View } = models;
      this.hasMany(View, {
        onDelete: 'CASCADE',
        foreignKey: {
          name: 'project_id',
          allowNull: false,
        },
      });
      this.hasMany(DataSeries, {
        onDelete: 'CASCADE',
        foreignKey: {
          name: 'project_id',
          allowNull: false,
        },
      });
    }
  }
  Project.init(
    {
      id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
      },
      version: DataTypes.INTEGER,
      name: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: false,
        comment: 'Project name',
      },
      description: {
        type: DataTypes.TEXT,
        comment: 'Project description.',
      },
      protected: DataTypes.BOOLEAN,
      active: DataTypes.BOOLEAN,
      idUser: {
        field: 'user_id',
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: 'Id. of the user in project',
      },
    },
    {
      sequelize,
      schema: 'terrama2',
      modelName: 'Project',
      underscored: true,
      underscoredAll: true,
      timestamps: false,

      // instanceMethods: {
      //   toObject(user = null) {
      //     const { protected, user_id } = this.dataValues;

      //     let hasPermission = !protected || (user ? (user.administrator || user.id == user_id) : false);

      //     return {
      //       class: 'Project',
      //       ...this.dataValues,
      //       hasPermission
      //     }
      //   }
      // },
    },
  );
  return Project;
};
