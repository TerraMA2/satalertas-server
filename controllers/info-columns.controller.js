const InfoColumnsService = require('../services/info-columns.service');
const {response} = require("../utils/response");

exports.getInfoColumns = async (req, res, next) => {
    try {
        const {viewId} = req.query;
        res.json(await InfoColumnsService.getInfoColumns(viewId));
    } catch (e) {
        next(e)
    }
};

exports.getAllTables = async (req, res, next) => {
    try {
        res.json(response(200, await InfoColumnsService.getAllTables()));
    } catch (e) {
        next(e)
    }
};

exports.getSecondaryTypes = async (req, res, next) => {
    try {
        res.json(response(200, await InfoColumnsService.getSecondaryTypes()));
    } catch (e) {
        next(e)
    }
};

exports.getTableColumns = async (req, res, next) => {
    try {
        const {tableId} = req.query;
        const {data} = await InfoColumnsService.getTableColumns(tableId);
        res.json(response(200, data));
    } catch (e) {
        next(e)
    }
};

exports.updateTableInfoColums = async (req, res, next) => {
    try {
        const {editions} = req.body;
        res.json(response(200, await InfoColumnsService.updateTableInfoColums(editions)))
    } catch (e) {
        next(e)

    }
}

exports.getInfocolumnsByTableName = async (req, res, next) => {
    try {
        const {tableName} = req.query;
        res.json(response(200, await InfoColumnsService.getInfocolumnsByTableName(tableName)))
    } catch (e) {
        next(e)
    }
}

exports.getInfocolumnsByViewId = async (req, res, next) => {
    try {
        const {viewId} = req.body;
        res.json(response(200, await InfoColumnsService.getInfocolumnsByViewId(viewId)))
    } catch (e) {
        next(e)
    }
}
