const express = require('express');
const router = express.Router();
const viewController = require('../controllers/view.controller');

router.get('/getSqlExport?:carRegister?:date?:filter', viewController.getSqlExport);
router.get('/getReportLayers', viewController.getReportLayers)
router.get('/getSidebarLayers', viewController.getSidebarLayers)
router.get('/:id?', viewController.get)

module.exports = router
