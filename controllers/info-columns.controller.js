const InfoColumnsService = require('../services/info-columns.service');
const Result = require('../utils/result');
const { msgError } = require('../utils/messageError');

exports.getInfoColumns = async (req, res) => {
  try {
    const { viewId } = req.query;
    res.json(await InfoColumnsService.getInfoColumns(viewId));
  } catch (e) {
    throw new Error(msgError(__filename, 'getInfoColumns', e));
  }
};

exports.getAllTables = async (_req, res) => {
  try {
    res.json(Result.ok(await InfoColumnsService.getAllTables()));
  } catch (e) {}
};

exports.getSecondaryTypes = async (_req, res) => {
  try {
    res.json(Result.ok(await InfoColumnsService.getSecondaryTypes()));
  } catch (e) {
    throw new Error(msgError(__filename, 'getSecondaryTypes', e));
  }
};

exports.getTableColumns = async (req, res) => {
  try {
    const { tableId } = req.query;
    const { data, columns } = await InfoColumnsService.getTableColumns(tableId);
    res.json(Result.ok(data, columns));
  } catch (e) {
    throw new Error(msgError(__filename, 'getTableColumns', e));
  }
};

exports.updateTableInfoColums = async (req, res) => {
    try {
        const { editions } = req.body;
        res.json(Result.ok(await InfoColumnsService.updateTableInfoColums(editions)))
    } catch (e) {
        throw new Error(msgError(__filename, 'updateTableInfoColums', e))
        
    }
}

exports.getInfocolumnsByTableName = async (req, res) => {
  try {
    const { tableName } = req.query;
    res.json(Result.ok(await InfoColumnsService.getInfocolumnsByTableName(tableName)))
  } catch (e) {
    throw new Error(msgError(__filename, 'getInfocolumnsByTableName', e))
  }
}

exports.getInfocolumnsByViewId = async (req, res) => {
  try {
    const { viewId } = req.body;
    console.log('info-columns.contoler byViewId:', req.body, `é array ${typeof viewId}`)
    res.json(Result.ok(await InfoColumnsService.getInfocolumnsByViewId(viewId)))
  } catch (e) {
    throw new Error(msgError(__filename, 'getInfocolumnsByViewId', e))
  }
}
