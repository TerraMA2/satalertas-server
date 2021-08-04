const biomeService = require(__dirname + '/../services/biome.service');
const logger = require("../utils/logger");

exports.getAll = async (req, res) => {
    try {
        res.json(await biomeService.getAll());
    } catch (e) {
        res.json(res.err(e));
        const msgErr = `In biome.controller, method getAll:${e}`;
        logger.error(msgErr);
    }
};
