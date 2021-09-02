const express = require('express');
const router = express.Router();
const InfoColumnsController = require('../controllers/info-columns.controller');

router.get('/getAllTables', InfoColumnsController.getAllTables);
router.get('/getSecondaryTypes', InfoColumnsController.getSecondaryTypes);
router.get('/tableColumns?:tableId', InfoColumnsController.getTableColumns);
router.get('/getInfocolumnsByTableName?:tableName', InfoColumnsController.getInfocolumnsByTableName);
router.get('/getInfocolumnsByViewId?:tableName', InfoColumnsController.getInfocolumnsByViewId);
router.get('/:viewId?', InfoColumnsController.getInfoColumns);
router.put('/tableColumns?:editions*', InfoColumnsController.updateTableInfoColums);

//getInfocolumnsByTableName
module.exports = router;
