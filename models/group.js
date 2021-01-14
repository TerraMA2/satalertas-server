'use strict';
module.exports = (sequelize, DataTypes) => {
  const Group = sequelize.define('groups', {
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
  }, {
    schema: 'terrama2',
    underscored: true,
    underscoredAll: true,
    timestamps: false
  });
  Group.associate = function(models) {
    Group.belongsTo(models.project, {
      onDelete: 'RESTRICT',
      foreignKey: 'idProject',
      as: 'projetc',
      otherKey: 'idProject'
    });
    Group.belongsToMany(models.rel_group_view, {
      through: 'RelGroupView',
      onDelete: 'CASCADE',
      foreignKey: 'idGroup',
      as: 'relGroupVSiew',
      otherKey: 'idView'
    });
  };
  return Group;
};
