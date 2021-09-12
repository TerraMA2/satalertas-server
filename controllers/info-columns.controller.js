const InfoColumnsService = require('../services/info-columns.service');
const {response} = require("../utils/response");
const httpStatus = require('../enum/http-status');

exports.getInfoColumns = async (req, res, next) => {
    try {
        const {viewId} = req.query;
        const infoColumns = await InfoColumnsService.getInfoColumns(viewId);
        res.json(response(httpStatus.SUCCESS, infoColumns));
    } catch (e) {
        next(e)
    }
};

exports.getAllTables = async (req, res, next) => {
    try {
        const tables = await InfoColumnsService.getAllTables();
        res.json(response(httpStatus.SUCCESS, tables));
    } catch (e) {
        next(e)
    }
};

exports.getSecondaryTypes = async (req, res, next) => {
    try {
        const secondaryTypes = await InfoColumnsService.getSecondaryTypes();
        res.json(response(httpStatus.SUCCESS, secondaryTypes));
    } catch (e) {
        next(e)
    }
};

exports.getTableColumns = async (req, res, next) => {
    try {
        const {tableId} = req.query;
        const {data} = await InfoColumnsService.getTableColumns(tableId);
        res.json(response(httpStatus.SUCCESS, data));
    } catch (e) {
        next(e)
    }
};

exports.updateTableInfoColums = async (req, res, next) => {
    try {
        const {editions} = req.body;
        const result = await InfoColumnsService.updateTableInfoColums(editions);
        res.json(response(200, result))
    } catch (e) {
        next(e)
    }
}

exports.getInfocolumnsByTableName = async (req, res, next) => {
    try {
        const {tableName} = req.query;
        const infoColumns = await InfoColumnsService.getInfocolumnsByTableName(tableName);
        res.json(response(httpStatus.SUCCESS, infoColumns));
    } catch (e) {
        next(e)
    }
}

exports.getInfocolumnsByViewId = async (req, res, next) => {
    try {
        const {viewId} = req.body;
        const infoColumns = await InfoColumnsService.getInfocolumnsByViewId(viewId);
        res.json(response(httpStatus.SUCCESS, infoColumns))
    } catch (e) {
        next(e)
    }
}
