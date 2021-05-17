'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Group extends Model {
    static associate(models) {
      const { views } = models;

      this.belongsToMany(views, {
        through: 'rel_group_view',
        as: 'relGroupView',
        foreignKey: 'id_group',
      })
    }
  }

  Group.init({
    id: {
      type: DataTypes.UUID,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: "Name of the group"
    },
    code: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: "Code of the group"
    }
  },{
    sequelize,
    modelName: 'Group',
    tableName: 'groups',
    schema: 'terrama2',
    underscored: true,
    underscoredAll: true,
    timestamps: false
  })
  return Group;
}
