'use strict';
module.exports = (sequelize, DataTypes) => {
  const RelGroupView = sequelize.define('rel_group_view', {
    id: {
      type: DataTypes.UUID,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
  }, {
    schema: 'terrama2',
    underscored: true,
    underscoredAll: true,
    timestamps: false
  })
  RelGroupView.associate = function(models) {
    RelGroupView.belongsTo(models.views, {
      through: 'views',
      onDelete: 'RESTRICT',
      foreignKey: 'id_view',
      as: 'views',
      otherKey: 'id_view'
    });
    RelGroupView.belongsTo(models.groups, {
      through: 'groups',
      onDelete: 'RESTRICT',
      foreignKey: 'id_group',
      as: 'groups',
      otherKey: 'id_group'
    });
  };
  return RelGroupView;
};
