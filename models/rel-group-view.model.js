'use strict';
const { Model } = require('sequelize');

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
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
        comment: "View name"
      },
      description: {
        type: DataTypes.TEXT,
        comment: "View description"
      },
      active: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        default: true,
        comment: "It defines view can be used and retrieved. Default is true."
      },
      private: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        default: false,
        comment: "It defines if the view is private. Default is false."
      },
      schedule_type: {
        type: DataTypes.INTEGER,
        allowNull: true
      },
      source_type: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: "It defines the type of data source that create the view. Alert, Analysis, Static Data or Dynamic Data"
      },
      is_primary: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        default: false,
        comment: "It defines if the layer is parent or not. Default is false."
      },
      sub_layers: {
        type: DataTypes.ARRAY(DataTypes.INTEGER),
        allowNull: true,
        comment: "It defines which layers are sub layers of this layer."
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
