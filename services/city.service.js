const {City, sequelize} = require('../models');

module.exports.get = async () => {
  const options = {
    attributes: [
      ['municipio', 'name'],
      ['geocodigo', 'value'],
      ['geocodigo', 'geocodigo']
    ],
    order: [
      ['municipio']
    ],
    raw: true,
  };
  let result = await City.findAll(options);
  return result.map(item => ({name: item.name, value: item}))
}

module.exports.getRegions = async () => {
  const options = {
    attributes: [
      ['comarca', 'name']
    ],
    group: 'comarca',
    order: [
      ['comarca']
    ]
  };
  return await City.findAll(options);
}
module.exports.getMesoregions = async () => {
  const options = {
    attributes: [
      ['nm_meso', 'name'],
      [sequelize.fn('ARRAY_AGG', sequelize.col('geocodigo')), 'geocodeList']
    ],
    group: 'nm_meso',
    order: [
      ['nm_meso']
    ]
  };
  return await City.findAll(options);
}
module.exports.getImmediateRegion = async () => {
  const options = {
    attributes: [
      ['nm_rgi', 'name'],
      [sequelize.fn('ARRAY_AGG', sequelize.col('geocodigo')), 'geocodeList']
    ],
    group: 'nm_rgi',
    order: [
      ['nm_rgi']
    ]
  };
  return await City.findAll(options);
}
module.exports.getIntermediateRegion = async () => {
  const options = {
    attributes: [
      ['nm_rgint', 'name'],
      [sequelize.fn('ARRAY_AGG', sequelize.col('geocodigo')), 'geocodeList']
    ],
    group: 'nm_rgint',
    order: [
      ['nm_rgint']
    ]
  };
  return await City.findAll(options);
}
module.exports.getPjbh = async () => {
  const options = {
    attributes: [
      ['pjbh', 'name'],
      [sequelize.fn('ARRAY_AGG', sequelize.col('geocodigo')), 'geocodeList']
    ],
    group: 'pjbh',
    order: [
      ['pjbh']
    ]
  };
  return await City.findAll(options);
}
module.exports.getMicroregions = async () => {
  const options = {
    attributes: [
      ['nm_micro', 'name'],
      [sequelize.fn('ARRAY_AGG', sequelize.col('geocodigo')), 'geocodeList']
    ],
    group: 'nm_micro',
    order: [
      ['nm_micro']
    ]
  };
  return await City.findAll(options);
}
