const express = require('express');
const router = express.Router();
const synthesisController = require('../controllers/synthesis.controller');


router.get('/getPropertyData', synthesisController.getPropertyData);
router.get('/getVisions', synthesisController.getVisions);
router.get('/getLegends', synthesisController.getLegends);
router.get('/getDetailedVisions', synthesisController.getDetailedVisions);
router.get('/getDeforestation', synthesisController.getDeforestation);
router.get('/getDeterHistory', synthesisController.getDeterHistory);
router.get('/getProdesHistory', synthesisController.getProdesHistory);
router.get('/getFireSpotHistory', synthesisController.getFireSpotHistory);
router.get('/getBurnedAreaHistory', synthesisController.getBurnedAreaHistory);
router.get('/getCharts', synthesisController.getCharts);

module.exports = router;
