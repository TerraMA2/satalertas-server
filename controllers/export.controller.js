const ExportService = require("../services/export.service.js");

exports.get = async (req, res) => {
    try {
        const filePath = await ExportService.get(req.query);
        res.download(filePath);
    } catch (e) {
        res.json(e);
    }
};
