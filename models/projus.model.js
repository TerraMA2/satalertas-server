'use strict';
module.exports = (sequelize, DataTypes) => {
  const Projus = sequelize.define('de_projus_bacias_sema', {
    gid: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    findPromot: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    shapeLeng: {
      type: DataTypes.DOUBLE,
      allowNull: false
    },
    areaKm: {
      field: 'area_km2',
      type: DataTypes.DOUBLE,
      allowNull: false
    },
    areaHa: {
      type: DataTypes.DOUBLE,
      allowNull: false
    },
    shapeLe: {
      field: 'shape_le_1',
      type: DataTypes.DOUBLE,
      allowNull: false
    },
    shapeArea: {
      type: DataTypes.DOUBLE,
      allowNull: false
    },
    geom: {
      type: DataTypes.DOUBLE,
      allowNull: false
    },
    promotoria: {
      type: DataTypes.STRING,
      allowNull: false
    },
    pjbh: {
      type: DataTypes.STRING,
      allowNull: false
    }
  }, {
    schema: 'public',
    underscored: true,
    underscoredAll: true,
    timestamps: false,
    freezeTableName: true
  });

  Projus.associate = function(models) {
  };

  return Projus
}
