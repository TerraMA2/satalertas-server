const
  models = require('../models');
  Report = models.Report;
  ReportService = require("../services/report.service");

exports.upload = async (req, res) => {
    const document = req.body;

    res.json(await ReportService.save(document));
};

exports.get = async (req, res) => {
    const id = req.query.id;

    res.json(await ReportService.get(id));
};

exports.delete = async (req, res) => {
  const id = req.params.id;

  res.json(await ReportService.delete(id));
};

exports.newNumber = async (req, res) => {
  res.json(await ReportService.newNumber(req.query.type));
};

exports.getReportsByCARCod = async (req, res) => {
  res.json(await ReportService.getReportsByCARCod(req.query.carCode));
};
