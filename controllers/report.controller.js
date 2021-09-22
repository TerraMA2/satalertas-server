const reportService = require("../services/report.service");
const {response} = require("../utils/response.utils");
const httpStatus = require('../enum/http-status');

exports.get = async (req, res, next) => {
    try {
        const id = req.query.id;
        const reports = await reportService.get(id);
        res.json(response(httpStatus.SUCCESS, reports));
    } catch (e) {
        next(e);
    }
};

exports.getReportsByCARCod = async (req, res, next) => {
    try {
        const register = req.query.carGid.length > 13 ? req.query.carGid : req.query.carGid.replace('_', '/');
        const reports = await reportService.getReportsByCARCod(register);
        res.json(response(httpStatus.SUCCESS, reports));
    } catch (e) {
        next(e);
    }
};

exports.generatePdf = async (req, res, next) => {
    try {
        const {reportData} = req.body.params
        const pdf = await reportService.generatePdf(reportData);
        res.json(response(httpStatus.SUCCESS, pdf));
    } catch (e) {
        next(e);
    }
};

exports.getReportCarData = async (req, res, next) => {
    try {
        const {carRegister, date, type, filter} = req.query;
        const carData = await reportService.getReportCarData(carRegister, date, type, filter);
        res.json(response(httpStatus.SUCCESS, carData));
    } catch (e) {
        next(e);
    }
};

exports.getPointsAlerts = async (req, res, next) => {
    try {
        const {carRegister, date, type} = req.query;
        const points = await reportService.getPointsAlerts(carRegister, date, type);
        res.json(response(httpStatus.SUCCESS, points));
    } catch (e) {
        next(e);
    }
};

exports.createPdf = async (req, res, next) => {
    try {
        const {reportData} = req.body.params
        const result = await reportService.createPdf(reportData);
        res.json(response(httpStatus.SUCCESS, result));
    } catch (e) {
        next(e);
    }
};
