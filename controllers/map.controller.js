const mapService = require(__dirname + '/../services/map.service');

exports.getAnalysisData = async (req, res) => {
    try {
        const params = JSON.parse(req.query.specificParameters);
        params.date = req.query.date;
        params.filter = req.query.filter;

        res.json(await mapService.getAnalysisData(params));
    } catch (e) {
        res.json(e);
    }
};

exports.getStaticData = async (req, res) => {
    try {
        const params = {
            specificParameters,
            date,
            filter
        } = req.query;

        res.json(await mapService.getStaticData(params));
    } catch (e) {
        res.json(e);
    }
};

exports.getDynamicData = async (req, res) => {
    try {
        const params = {
            specificParameters,
            date,
            filter
        } = req.query;

        res.json(await mapService.getDynamicData(params));
    } catch (e) {
        res.json(e);
    }
};
