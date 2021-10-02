const reportService = require("../services/new-report.service");
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
    const {carGid, date, type, filter, pdf} = req.query;
    const reports = await reportService.getReport(carGid, date, type, filter, pdf);
    res.json(response(httpStatus.SUCCESS, reports));
  } catch (e) {
    next(e);
  }
};

module.exports.getNDVI = async (req, res, next) => {
    try {
        const {carGid, date, type} = req.query;
        const points = await reportService.getNDVI(carGid, date, type);
        res.json(response(httpStatus.SUCCESS, points));
    } catch (e) {
        next(e);
    }
};

exports.generatePdf = async (req, res, next) => {
  try {
    const {reportData} = req.body.params;
    const pdf = await reportService.generatePdf(reportData);
    res.json(response(httpStatus.SUCCESS, pdf));
  } catch (e) {
    next(e);
  }
};
