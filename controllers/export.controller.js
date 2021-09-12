const exportService = require("../services/export.service.js");
const {response} = require("../utils/response");
const httpStatus = require('../enum/http-status');

exports.get = async (req, res, next) => {
    try {
        const file = await exportService.get(req.body.params);
        res.json(response(httpStatus.SUCCESS, file));
    } catch (e) {
        next(e);
    }
};
