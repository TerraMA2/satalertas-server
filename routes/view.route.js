const express = require('express');
const router = express.Router();
const viewController = require('../controllers/view.controller');

router.get('/getReportLayers', viewController.getReportLayers)
router.get('/getSidebarLayers', viewController.getSidebarLayers)

module.exports = router
