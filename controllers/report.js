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
  res.json(await ReportService.getReportsByCARCod(req.query.carCode.replace('_', '/')));
};

exports.delete = async (req, res) => {
  const id = req.params.id;

  res.json(await ReportService.delete(id));
};

exports.generatePdf = async (req, res) => {
  res.json(await ReportService.generatePdf(req.body.params.docDefinition, req.body.params.type, req.body.params.carCode));
};

exports.upload = async (req, res) => {
  const document = req.body;
  res.json(await ReportService.save(document));
};

exports.getReportCarData = async (req, res) => {
  res.json(await ReportService.getReportCarData(req.query));
};

exports.getSynthesisCarData = async (req, res) => {
  res.json(await ReportService.getSynthesisCarData(req.query));
};
