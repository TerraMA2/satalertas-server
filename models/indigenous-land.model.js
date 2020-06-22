'use strict';
module.exports = (sequelize, DataTypes) => {
  const IndigenousLand = sequelize.define('de_terra_indigena_sema', {
    gid: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    id: {
      type: DataTypes.FLOAT,
      allowNull: false
    },
    areaM2: {
      field: 'area__m2_',
      type: DataTypes.FLOAT,
      allowNull: false
    },
    objectid: {
      type: DataTypes.FLOAT,
      allowNull: false
    },
    populacao: {
      type: DataTypes.FLOAT,
      allowNull: false
    },
    anoPopul1: {
      type: DataTypes.FLOAT,
      allowNull: false
    },
    areaHa: {
      type: DataTypes.FLOAT,
      allowNull: false
    },
    shapeLen1: {
      type: DataTypes.FLOAT,
      allowNull: false
    },
    shapeAre1: {
      type: DataTypes.FLOAT,
      allowNull: false
    },
    shapeLen: {
      type: DataTypes.FLOAT,
      allowNull: false
    },
    geom: {
      type: DataTypes.DOUBLE,
      allowNull: false
    },
    tiName: {
      field: 'nome_ti_a1',
      type: DataTypes.STRING,
      allowNull: false
    },
    name: {
      field: 'nome',
      type: DataTypes.STRING,
      allowNull: false
    },
    etnia: {
      type: DataTypes.STRING,
      allowNull: false
    },
    municipio: {
      type: DataTypes.STRING,
      allowNull: false
    },
    instLega1: {
      type: DataTypes.STRING,
      allowNull: false
    },
    dataInst: {
      type: DataTypes.STRING,
      allowNull: false
    },
    sitJurid1: {
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

  IndigenousLand.associate = function(models) {
  };

  return IndigenousLand
}
