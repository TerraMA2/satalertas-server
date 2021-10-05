'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class County extends Model {
    static associate(models) {
    }
  };
  County.init({
    name: {
      type: DataTypes.STRING,
      comment: "County name",
    },
    geocodigo: {
      type: DataTypes.STRING,
      comment: "County geocode"
    },
    geocodeList: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      comment: "List of citie geocodes that belongs to county"
    },
    nameList: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      comment: "List of cities names that belongs to county"
    },
  }, {
    sequelize,
    schema: 'public',
    tableName: 'region_county',
    modelName: 'County',
    underscored: true,
  });
  return County;
};
