const {IndigenousLand} = require('../models')

module.exports.get = async () => {
  const options = {
    attributes: [
      'gid',
      ['nome', 'name'],
      'nome_ti_a1',
      ['objectid', 'objectId']
    ],
    order: [
      ['name']
    ]
  };
  return await IndigenousLand.findAll(options);
}
