const { Biome } = require('../models');
const logger = require('../utils/logger');

module.exports = biomeService = {
  async getAll() {
    const options = {
      attributes: ['gid', 'name'],
      order: [['name']],
    };
    try {
      return await Biome.findAll(options);
    } catch (e) {
      const msgErr = `In conservation-unit.controller, method getAll:${e}`;
      logger.error(msgErr);
    }
  },
};
