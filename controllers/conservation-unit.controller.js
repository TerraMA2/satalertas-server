const conservationUnitService = require(__dirname + '/../services/conservation-unit.service');
const logger = require('../utils/logger');

exports.getAll = async (req, res) => {
    try {
        res.json(await conservationUnitService.getAll());
    } catch (e) {
      const msgErr = `In conservation-unit.controller, method getAll:${e}`;
      logger.error(msgErr);
      res.json(msgErr);
    }
};
