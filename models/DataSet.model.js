module.exports = function(sequelize, DataTypes) {
  const DataSet = sequelize.define("DataSet",
    {
      id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true
      },
      active: DataTypes.BOOLEAN
    },
    {
      tableName: 'data_sets',
      schema: 'terrama2',
      underscored: true,
      underscoredAll: true,
      timestamps: false,
    }
  );

  DataSet.associate = function(models) {
    DataSet.belongsTo(models.DataSeries, {
      foreignKey: {
        name: "data_series_id",
        onDelete: "CASCADE",
        foreignKey: {
          allowNull: false
        }
      }
    });

    DataSet.hasMany(models.DataSetFormat, {
      onDelete: 'CASCADE',
      foreignKey: {
        allowNull: false
      }
    });
  }

  return DataSet;
};
