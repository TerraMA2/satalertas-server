'use strict'
module.exports = (sequelize, DataTypes) => {
  const RegisteredView = sequelize.define('registered_views', {
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
    schema: 'terrama2',
    underscored: true,
    underscoredAll: true,
    timestamps: false,
  })
  RegisteredView.associate = function(models) {
    RegisteredView.belongsTo(models.views, {
      onDelete: "CASCADE",
      foreignKey: 'view_id',
      as: 'view'
    });
  }
  return RegisteredView
}
