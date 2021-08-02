const ReportService = require("../services/report.service");

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

exports.getReportCarData = async (req, res) => {
  res.json(await ReportService.getReportCarData(req.query));
};

exports.getPointsAlerts = async (req, res) => {
  const resp = await ReportService.getPointsAlerts(req.query);
  res.json(resp);
};

exports.createPdf = async (req, res) => {
  res.json(await ReportService.createPdf(req.body.params.reportData));
};
