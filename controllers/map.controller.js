const mapService = require(__dirname + '/../services/map.service');
const {response} = require("../utils/response");
const httpStatus = require('../enum/http-status');

exports.getAnalysisCentroid = async (req, res, next) => {
    try {
        const params = JSON.parse(req.query.specificParameters);
        params.date = req.query.date;
        params.filter = req.query.filter;
        const layer = JSON.parse(params.view);
        let type = layer.groupCode === 'BURNED' ? 'burned' : 'others'

        type = type.charAt(0).toUpperCase() + type.slice(1);
        const centroid = await mapService[`get${ type }Centroid`](params)
        res.json(response(httpStatus.SUCCESS, centroid));
    } catch (e) {
        next(e)
    }
};

exports.getPopupInfo = async (req, res, next) => {
    try {
        const params = {
            view: JSON.parse(JSON.parse(req.query.filter).specificParameters),
            date: JSON.parse(req.query.filter).date,
            filter: JSON.parse(req.query.filter).filter,
            groupCode: req.query.groupCode,
            carGid: parseInt(req.query.gid)
        };

        const popupInfo = await mapService.getPopupInfo(params);
        res.json(response(httpStatus.SUCCESS, popupInfo));
    } catch (e) {
        next(e)
    }
};

exports.getAnalysisData = async (req, res, next) => {
    try {
        const params = JSON.parse(req.query.specificParameters);
        params.date = req.query.date;
        params.filter = req.query.filter;

        const analysisData = await mapService.getAnalysisData(params);
        res.json(response(httpStatus.SUCCESS, analysisData));
    } catch (e) {
        next(e)
    }
};

exports.getStaticData = async (req, res, next) => {
    try {
        const params = {
            specificParameters,
            date,
            filter
        } = req.query;

        const staticData = await mapService.getStaticData(params)
        res.json(response(httpStatus.SUCCESS, staticData));
    } catch (e) {
        next(e)
    }
};

exports.getDynamicData = async (req, res, next) => {
    try {
        const params = {
            specificParameters,
            date,
            filter
        } = req.query;

        const dynamicData = await mapService.getDynamicData(params)
        res.json(response(httpStatus.SUCCESS, dynamicData));
    } catch (e) {
        next(e)
    }
};
