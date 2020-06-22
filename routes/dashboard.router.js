const express = require('express');
        router = express.Router();
        dashboardController = require('../controllers/dashboard.controller');

router.get('/getAnalysisTotals', dashboardController.getAnalysisTotals);
router.get('/getDetailsAnalysisTotals', dashboardController.getDetailsAnalysisTotals);

module.exports = router;
