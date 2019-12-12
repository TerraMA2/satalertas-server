'use strict'
module.exports = (sequelize, DataTypes) => {
  const Report = sequelize.define('Report', {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    file_name: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: "Report file name"
    },
    file_path: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: "Report file path"
    }
  }, {
    underscored: true,
    underscoredAll: true,
    timestamps: true,
  })
  Report.associate = function(models) {
  }
  return Report
}