const AnalyzeService = require("../services/analyze.service");

exports.getAllClassByType = async (req, res) => {
    res.json(await AnalyzeService.getAllClassByType(req.query.type));
};
