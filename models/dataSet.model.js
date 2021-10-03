const {Model} = require('sequelize');
module.exports = function (sequelize, DataTypes) {
  class DataSet extends Model {
    static associate(models) {
      const {DataSeries, DataSetFormat} = models;
      this.belongsTo(DataSeries, {
        as: 'dataSeries',
        foreignKey: {
          name: 'data_series_id',
          onDelete: 'CASCADE',
          foreignKey: {
            allowNull: false,
          },
        },
      });

      this.hasMany(DataSetFormat, {
        as: 'dataSetFormat',
        onDelete: 'CASCADE',
        foreignKey: {
          allowNull: false,
        },
      });
    }
  }

  DataSet.init(
      {
        id: {
          type: DataTypes.INTEGER,
          allowNull: false,
          primaryKey: true,
          autoIncrement: true,
        },
        active: DataTypes.BOOLEAN,
      },
      {
        sequelize,
        tableName: 'data_sets',
        schema: 'terrama2',
        modelName: 'DataSet',
        underscored: true,
        timestamps: false,
      },
  );

  return DataSet;
};
