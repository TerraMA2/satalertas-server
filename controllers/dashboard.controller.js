const DashboardService = require(__dirname + '/../services/dashboard.service');

exports.getAnalysis = async (req, res) => {
    try {
        const params = {
            specificParameters,
            date,
            filter
        } = req.query;

        res.json(await DashboardService.getAnalysis(params));
    } catch (e) {
        res.json(e);
    }
};

exports.getAnalysisCharts = async (req, res) => {
    try {
        const params = {
            specificParameters,
            date,
            filter
        } = req.query;

        res.json(await DashboardService.getAnalysisCharts(params));
    } catch (e) {
        res.json(e);
    }
};
