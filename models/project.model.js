'use strict';

module.exports = (sequelize, DataTypes) => {
  const Project = sequelize.define('project', {
    id: {
      type: DataTypes.UUID,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    version: DataTypes.INTEGER,
    name: DataTypes.STRING,
    description: DataTypes.TEXT,
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
    timestamps: false
  });
  Project.associate = function(models) {
    // associations can be defined here
  };
  return Project;
};