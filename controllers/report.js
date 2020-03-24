const
  models = require('../models');
  Report = models.Report;
  ReportService = require("../services/report.service");

exports.get = async (req, res) => {
    const id = req.query.id;

    res.json(await ReportService.get(id));
};

exports.newNumber = async (req, res) => {
  res.json(await ReportService.newNumber(req.query.type));
};

exports.getReportsByCARCod = async (req, res) => {
  const register = req.query.carCode.length > 13 ? req.query.carCode : req.query.carCode.replace('_', '/');
  res.json(await ReportService.getReportsByCARCod(register));
};

exports.delete = async (req, res) => {
  const id = req.params.id;

  res.json(await ReportService.delete(id));
};

exports.generatePdf = async (req, res) => {
  res.json(await ReportService.generatePdf(req.body.params.reportData));
};

exports.upload = async (req, res) => {
  const document = req.body;
  res.json(await ReportService.save(document));
};

exports.getReportCarData = async (req, res) => {
  res.json(await ReportService.getReportCarData(req.query));
};

exports.getPointsAlerts = async (req, res) => {
  res.json(await ReportService.getPointsAlerts(req.query));
};

exports.getSynthesisCarData = async (req, res) => {
  res.json(await ReportService.getSynthesisCarData(req.query));
};

exports.createPdf = async (req, res) => {
  res.json(await ReportService.createPdf(req.body.params.reportData));
};
