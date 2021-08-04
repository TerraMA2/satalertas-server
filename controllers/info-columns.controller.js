const InfoColumnsService = require("../services/info-columns.service");

exports.getInfoColumns = async (req, res) => {
    res.json(await InfoColumnsService.getInfoColumns(req.query.viewId))
};
