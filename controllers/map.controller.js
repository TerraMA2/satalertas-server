const mapService = require(__dirname + '/../services/map.service');

exports.getAnalysisCentroid = async (req, res) => {
    try {
        const params = JSON.parse(req.query.specificParameters);
        params.date = req.query.date;
        params.filter = req.query.filter;
        const layer = JSON.parse(params.view);
        const type = layer.groupCode === 'BURNED' ? 'burned' : 'others'

        res.json(await mapService.getAnalysisCentroid[type](params));
    } catch (e) {
        res.json(e);
    }
};

exports.getPopupInfo = async (req, res) => {
    try {
        const params = {
            view: JSON.parse(JSON.parse(req.query.filter).specificParameters),
            date: JSON.parse(req.query.filter).date,
            filter: JSON.parse(req.query.filter).filter,
            groupCode: req.query.groupCode,
            carGid: parseInt(req.query.gid)
        };

        res.json(await mapService.getPopupInfo(params));
    } catch (e) {
        throw new Error(e);
    }
};

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
