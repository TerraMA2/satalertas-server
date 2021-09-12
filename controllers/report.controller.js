const ReportService = require("../services/report.service");
const {response} = require("../utils/response");
const httpStatus = require('../enum/http-status');

exports.get = async (req, res, next) => {
    try {
        const id = req.query.id;
        const reports = await ReportService.get(id);
        res.json(response(httpStatus.SUCCESS, reports));
    } catch (e) {
        next(e);
    }
};

exports.newNumber = async (req, res, next) => {
    try {
        const newNumber = await ReportService.newNumber(req.query.type);
        res.json(response(httpStatus.SUCCESS, newNumber));
    } catch (e) {
        next(e);
    }
};

exports.getReportsByCARCod = async (req, res, next) => {
    try {
        const register = req.query.carGid.length > 13 ? req.query.carGid : req.query.carGid.replace('_', '/');
        const reports = await ReportService.getReportsByCARCod(register);
        res.json(response(httpStatus.SUCCESS, reports));
    } catch (e) {
        next(e);
    }
};

exports.delete = async (req, res, next) => {
    try {
        const {id} = req.params;
        const result = await ReportService.delete(id);
        res.json(response(httpStatus.SUCCESS, null, result));
    } catch (e) {
        next(e);
    }
};

exports.generatePdf = async (req, res, next) => {
    try {
        const {reportData} = req.body.params
        const pdf = await ReportService.generatePdf(reportData);
        res.json(response(httpStatus.SUCCESS, pdf));
    } catch (e) {
        next(e);
    }
};

exports.getReportCarData = async (req, res, next) => {
    try {
        const {carRegister, date, type, filter} = req.query;
        const carData = await ReportService.getReportCarData(carRegister, date, type, filter);
        res.json(response(httpStatus.SUCCESS, carData));
    } catch (e) {
        next(e);
    }
};

exports.getPointsAlerts = async (req, res, next) => {
    try {
        const {carRegister, date, type} = req.query;
        const points = await ReportService.getPointsAlerts(carRegister, date, type);
        res.json(response(httpStatus.SUCCESS, points));
    } catch (e) {
        next(e);
    }
};

exports.createPdf = async (req, res, next) => {
    try {
        const {reportData} = req.body.params
        const result = await ReportService.createPdf(reportData);
        res.json(response(httpStatus.SUCCESS, result));
    } catch (e) {
        next(e);
    }
};
