const dashboardService = require(__dirname + '/../services/dashboard.service');
const {response} = require("../utils/response.utils");
const httpStatus = require('../enum/http-status');

exports.getAnalysis = async (req, res, next) => {
  try {
    const analysis = await dashboardService.getAnalysis(req.query)
    res.json(response(httpStatus.SUCCESS, analysis));
  } catch (e) {
    next(e)
  }
};

exports.getAnalysisCharts = async (req, res, next) => {
  try {
    const analysisCharts = await dashboardService.getAnalysisCharts(req.query);
    res.json(response(httpStatus.SUCCESS, analysisCharts));
  } catch (e) {
    next(e)
  }
};
