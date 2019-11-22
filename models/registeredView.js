'use strict'
module.exports = (sequelize, DataTypes) => {
  const RegisteredView = sequelize.define('RegisteredViews', {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    workspace: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: "Map server workspace"
    },
    uri: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: "Map server URI"
    }
  }, {
    underscored: true,
    underscoredAll: true,
    timestamps: true,
  })
  RegisteredView.associate = function(models) {
    RegisteredView.belongsTo(models.View, {
      onDelete: "CASCADE",
      foreignKey: 'view_id',
      as: 'view'
    });
  }
  return RegisteredView
}