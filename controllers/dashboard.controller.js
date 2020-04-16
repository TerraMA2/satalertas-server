const DashboardService = require(__dirname + '/../services/dashboard.service');

exports.getAnalysisTotals = async (req, res) => {
    try {
        const params = {
            specificParameters,
            date,
            filter
        } = req.query;

        res.json(await DashboardService.getAnalysisTotals(params));
    } catch (e) {
        res.json(e);
    }
};

exports.getDetailsAnalysisTotals = async (req, res) => {
    try {
        const params = {
            specificParameters,
            date,
            filter
        } = req.query;

        res.json(await DashboardService.getDetailsAnalysisTotals(params));
    } catch (e) {
        res.json(e);
    }
};
