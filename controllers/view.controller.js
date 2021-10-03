const viewService = require("../services/view.service");
const {response} = require("../utils/response.utils");
const httpStatus = require('../enum/http-status');

exports.getSidebarLayers = async (req, res, next) => {
  try {
    const sidebarLayers = await viewService.getSidebarLayers();
    res.json(response(httpStatus.SUCCESS, sidebarLayers));
  } catch (e) {
    next(e);
  }
}

exports.getReportLayers = async (req, res, next) => {
  try {
    const reportLayers = await viewService.getReportLayers();
    res.json(response(httpStatus.SUCCESS, reportLayers));
  } catch (e) {
    next(e);
  }
}
