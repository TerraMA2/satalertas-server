const ViewService = require("../services/view.service");
const {response} = require("../utils/response");
const httpStatus = require('../enum/http-status');

exports.getSidebarLayers = async (req, res, next) => {
    try {
        const sidebarLayers = await ViewService.getSidebarLayers();
        res.json(response(httpStatus.SUCCESS, sidebarLayers));
    } catch (e) {
        next(e);
    }
}

exports.getReportLayers = async (req, res, next) => {
    try {
        const reportLayers = await ViewService.getReportLayers();
        res.json(response(httpStatus.SUCCESS, reportLayers));
    } catch (e) {
        next(e);
    }
}
