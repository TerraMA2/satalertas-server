const logger = require('../utils/logger')
const indigenousLandService = require(__dirname + '/../services/indigenous-land.service');
exports.getAll = async (req, res) => {
    try {
        res.json(await indigenousLandService.getAll());
    } catch (e) {
      const msgErr = `In indigenous-land.controller, method getAll:${e}`;
      logger.error(msgErr);
      res.json(msgErr);
    }
};
