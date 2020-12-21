const ConfigService = require("../services/config.service");

exports.getSynthesisConfig = async (req, res) => {
    res.json(await ConfigService.getSynthesisConfig())
};
exports.getInfoColumns = async (req, res) => {
    res.json(await ConfigService.getInfoColumns(req.query.codGroup))
};
