const logger = require("../utils/logger");
const projusService = require(__dirname + '/../services/projus.service');
exports.getAll = async (req, res) => {
    try {
        res.json(await projusService.getAll());
    } catch (e) {
        res.json(e);
        const msgErr = `In projus.controller, method getAll:${e}`;
        logger.error(msgErr);
    }
};
