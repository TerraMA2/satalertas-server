'use strict';
module.exports = (sequelize, DataTypes) => {
  const Biome = sequelize.define('de_biomas_mt', {
    gid: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    gidOther: {
      field: '__gid',
      type: DataTypes.DOUBLE,
      allowNull: false
    },
    geom: {
      type: DataTypes.DOUBLE,
      allowNull: false
    },
    name: {
      field: 'bioma',
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

  Biome.associate = function(models) {
  };

  return Biome
}
