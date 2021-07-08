'use strict'
module.exports = (sequelize, DataTypes) => {
  const RegisteredView = sequelize.define('RegisteredView', {
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
    tableName: 'registered_views',
    schema: 'terrama2',
    underscored: true,
    underscoredAll: true,
    timestamps: false,
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
