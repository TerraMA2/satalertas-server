const {Biome, sequelize} = require('../models');

exports.get = async () => {
  const options = {
    attributes: [
      'gid', 'name',
      [sequelize.fn("ST_AsText", sequelize.fn("ST_ExteriorRing", sequelize.col('geom'))), 'wkt'],
    ],
    order: [['name']],
  };
  return await Biome.findAll(options);
};
