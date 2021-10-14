const {County, sequelize} = require('../models');

module.exports.getAllCounties = async () => {
  const options = {
    attributes: [
      'name', 'geocodigo',
      ['geocode_list', 'geocodeList'], ['name_list', 'nameList']
    ],
    order: [
      ['name']
    ]
  };
  const result = await County.findAll(options);
  return result.map(item => {
    item.nameList = item.nameList.map(item => item.replace("'", "''"));
    return {
    name: item.name,
    value: item
  }})
}

module.exports.getCountyData = async (params) => {
  const {geocodigo=null, name=null} = params;
  const options = {
    attributes: [
      ['geocode_list', 'geocodeList'], ['name_list', 'nameList']
    ],
    order: [
      ['name']
    ],
    plain: true,
  };
  if (geocodigo) {
    options.where = { geocodigo }
  } else {
    options.where = { name }
  };
  return await County.findAll(options);
}
