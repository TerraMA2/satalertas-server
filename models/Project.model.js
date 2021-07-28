'use strict'

module.exports = (sequelize, DataTypes) => {
  const Project = sequelize.define("Project", {
      id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true
      },
      version: DataTypes.INTEGER,
      name: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: false,
        comment: "Project name"
      },
      description: {
        type: DataTypes.TEXT,
        comment: "Project description."
      },
      protected: DataTypes.BOOLEAN,
      active: DataTypes.BOOLEAN,
      idUser: {
        field: 'user_id',
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: "Id. of the user in project"
      }
    }, {
      schema: 'terrama2',
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

    }
    );
    Project.associate= function(models) {

      Project.hasMany(models.DataSeries, {
        onDelete: "CASCADE",
        foreignKey: {
          name: 'project_id',
          allowNull: false
        }
      });

      // Setting project to View. A project has many views
      Project.hasMany(models.View, {
        onDelete: "CASCADE",
        foreignKey: {
          name: "project_id",
          allowNull: false
        }
      });
    }
    
  return Project;
};
