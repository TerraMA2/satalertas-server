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
    path: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: "Report file path"
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
