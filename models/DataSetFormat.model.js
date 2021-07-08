'use strict'

module.exports = (sequelize, DataTypes) => {
  const DataSetFormat = sequelize.define("DataSetFormat",
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
      tableName: 'data_set_formats',
      schema: 'terrama2',
      underscored: true,
      underscoredAll: true,
      timestamps: false,
    });
    
  DataSetFormat.associate = function(models) {
      DataSetFormat.belongsTo(models.DataSet, {
        onDelete: "CASCADE",
        foreignKey: {
          allowNull: false
        }
      });
    }

  return DataSetFormat;
};
