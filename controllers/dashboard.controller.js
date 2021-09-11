const DashboardService = require(__dirname + '/../services/dashboard.service');

exports.getAnalysis = async (req, res, next) => {
    try {
        res.json(await DashboardService.getAnalysis(req.query));
    } catch (e) {
        next(e)
    }
};

exports.getAnalysisCharts = async (req, res, next) => {
    try {
        res.json(await DashboardService.getAnalysisCharts(req.query));
    } catch (e) {
        next(e)
    }
};
