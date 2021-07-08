'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Group extends Model {
    static associate(models) {
      const { View } = models;

      this.belongsToMany(View, {
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
      comment: "Nome do Grupo"
    },
    code: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: "Código do Grupo"
    }, 
    active_area: {
      type: DataTypes.BOOLEAN,
      default: false,
      comment: "Esse campo indica qual será a primeira seleção no dashboard."
    },
    view_graph: {
      type: DataTypes.BOOLEAN,
      default: false,
      comment: "Esse campo indica se o grupo será exibido no Dashboard."
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
