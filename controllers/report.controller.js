const ReportService = require("../services/report.service");

exports.get = async (req, res, next) => {
    try {
        const id = req.query.id;
        res.json(await ReportService.get(id));
    } catch (e) {
        next(e);
    }
};

exports.newNumber = async (req, res, next) => {
    try {
        res.json(await ReportService.newNumber(req.query.type));
    } catch (e) {
        next(e);
    }
};

exports.getReportsByCARCod = async (req, res, next) => {
    try {
        const register = req.query.carGid.length > 13 ? req.query.carGid : req.query.carGid.replace('_', '/');
        res.json(await ReportService.getReportsByCARCod(register));
    } catch (e) {
        next(e);
    }
};

exports.delete = async (req, res, next) => {
    try {
        const {id} = req.params;
        res.json(await ReportService.delete(id));
    } catch (e) {
        next(e);
    }
};

exports.generatePdf = async (req, res, next) => {
    try {
        const {reportData} = req.body.params
        res.json(await ReportService.generatePdf(reportData));
    } catch (e) {
        next(e);
    }
};

exports.getReportCarData = async (req, res, next) => {
    try {
        const {carRegister, date, type, filter} = req.query;
        res.json(await ReportService.getReportCarData(carRegister, date, type, filter));
    } catch (e) {
        next(e);
    }
};

exports.getPointsAlerts = async (req, res, next) => {
    try {
        const {carRegister, date, type} = req.query;
        res.json(await ReportService.getPointsAlerts(carRegister, date, type));
    } catch (e) {
        next(e);
    }
};

exports.createPdf = async (req, res, next) => {
    try {
        const {reportData} = req.body.params
        res.json(await ReportService.createPdf(reportData));
    } catch (e) {
        next(e);
    }
};
