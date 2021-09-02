const express = require('express');
router = express.Router();
mapController = require('../controllers/map.controller');


router.get('/getAnalysisCentroid', mapController.getAnalysisCentroid);
router.get('/getPopupInfo', mapController.getPopupInfo);
router.get('/getAnalysisData', mapController.getAnalysisData);
router.get('/getStaticData', mapController.getStaticData);
router.get('/getDynamicData', mapController.getDynamicData);

module.exports = router;
