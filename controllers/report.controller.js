const reportService = require("../services/report.service");
const {response} = require("../utils/response.utils");
const httpStatus = require('../enum/http-status');

module.exports.get = async (req, res, next) => {
  try {
    const {reportId, carGid} = req.query;
    let reports;
    if (reportId) {
      reports = await reportService.getById(reportId);
    } else if (carGid) {
      reports = await reportService.getByCarGid(carGid);
    }
    res.json(response(httpStatus.SUCCESS, reports));
  } catch (e) {
    next(e);
  }
};

module.exports.getReport = async (req, res, next) => {
  try {
    const {carGid, date, type, filter} = req.query;
    const reports = await reportService.getReport(carGid, date, type, filter);
    res.json(response(httpStatus.SUCCESS, reports));
  } catch (e) {
    next(e);
  }
};

module.exports.getNDVI = async (req, res, next) => {
  try {
    const {carGid, date} = req.query;
    const ndvi = await reportService.getNDVI(carGid, date);
    res.json(response(httpStatus.SUCCESS, ndvi));
  } catch (e) {
    next(e);
  }
};

exports.generateReport = async (req, res, next) => {
  try {
    const {reportData} = req.body.params;
    const pdf = await reportService.generateReport(reportData);
    res.json(response(httpStatus.SUCCESS, pdf));
  } catch (e) {
    next(e);
  }
};
