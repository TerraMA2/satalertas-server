const ConfigService = require("../services/config.service");

exports.getInfoColumns = async (req, res) => {
    res.json(await ConfigService.getInfoColumns(req.query.viewId))
};
