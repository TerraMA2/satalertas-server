'use strict';
const { Model } = require('sequelize');
const allModels = require('./index')

module.exports = (sequelize, DataTypes) => {
  const { models } = sequelize;
  class RelGroupView extends Model {
  }

  RelGroupView.init({
    id_group: {
      type: DataTypes.INTEGER,
      references: {
        model: models.Group,
        key: 'id',
      }
    },
    id_view: {
      type: DataTypes.INTEGER,
      references: {
        model: models.view,
        key: 'id',
      }
    },
  }, {
    sequelize,
    modelName: 'rel_group_view',
    tableName: 'rel_group_views',
    schema: 'terrama2',
    underscored: true,
    underscoredAll: true,
    timestamps: false
  });
  // RelGroupView.associate = function(models) {
  //   RelGroupView.belongsTo(models.views, {
  //     through: 'views',
  //     onDelete: 'NO ACTION',
  //     foreignKey: 'id_view',
  //     as: 'views',
  //     otherKey: 'id_view'
  //   });
  //   RelGroupView.belongsTo(models.groups, {
  //     through: 'groups',
  //     onDelete: 'CASCADE',
  //     foreignKey: 'id_group',
  //     as: 'groups',
  //     otherKey: 'id_group'
  //   });
  // };
  return RelGroupView;
};
