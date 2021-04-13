'use strict';
module.exports = (sequelize, DataTypes) => {
  const Report = sequelize.define('reports', {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: "Report file name"
    },
    code: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: "Report code"
    },
    carCode: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: "Code of the CAR"
    },
    carGid: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: "GID of the table CAR"
    },
    path: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: "Report file path"
    },
    type: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: "Report of the report - DETER, PRODES, QUEIMADA"
    }
  }, {
    underscored: true,
    underscoredAll: true,
    timestamps: true,
  });

  Report.associate = function(models) {
  };

  return Report
}
