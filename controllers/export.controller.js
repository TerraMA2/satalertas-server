const exportService = require("../services/export.service.js");

exports.get = async (req, res, next) => {
    try {
        res.json(await exportService.get(req.body.params));
    } catch (e) {
        next(e);
    }
};
