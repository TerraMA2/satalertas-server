const express = require('express');
router = express.Router();
dashboardController = require('../controllers/dashboard.controller');

router.get('/getAnalysis', dashboardController.getAnalysis);
router.get('/getAnalysisCharts', dashboardController.getAnalysisCharts);

module.exports = router;
