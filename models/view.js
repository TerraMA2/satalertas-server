'use strict'

module.exports = (sequelize, DataTypes) => {
  const View = sequelize.define('views', {
    id: {
      type: DataTypes.UUID,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
      comment: "View identifier"
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
    charts: {
      type: DataTypes.JSONB,
      allowNull: true,
      comment: "Charts"
    }
  }, {
    schema: 'terrama2',
    underscored: true,
    underscoredAll: true,
    timestamps: false,
  })
  View.associate = function(models) {
    View.belongsToMany(models.Group, {
      through: 'rel_group_view',
      as: 'relGroupView',
      foreignKey: 'id_view',
      onDelete: "SET NULL",
      otherKey: 'id_group'
    })
  }
  return View
}
