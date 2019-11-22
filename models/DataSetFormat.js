'use strict'
module.exports = function(sequelize, DataTypes) {
  var DataSetFormat = sequelize.define("DataSetFormats",
    {
      id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true
      },
      key: DataTypes.STRING,
      value: DataTypes.TEXT
    },
    {
      underscored: true,
      underscoredAll: true,
      timestamps: false,

      associate: function(models) {
        DataSetFormat.belongsTo(models.DataSet, {
          onDelete: "CASCADE",
          name: "data_set_id",
          onDelete: "CASCADE",
          foreignKey: {
            allowNull: false
          }
        });
      }
    }
  );

  return DataSetFormat;
};
