const {Projus} = require('../models');

module.exports.get = async () => {
  const options = {
    attributes: ['gid', ['promotoria', 'name']],
    order: [['promotoria']],
  };
  return await Projus.findAll(options);
}
