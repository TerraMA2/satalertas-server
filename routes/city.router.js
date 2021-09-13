const express = require('express');
router = express.Router();
cityController = require('../controllers/city.controller');

router.get('/', cityController.get);
router.get('/getRegions', cityController.getRegions);
router.get('/getMesoregions', cityController.getMesoregions);
router.get('/getImmediateRegion', cityController.getImmediateRegion);
router.get('/getIntermediateRegion', cityController.getIntermediateRegion);
router.get('/getPjbh', cityController.getPjbh);
router.get('/getMicroregions', cityController.getMicroregions);

module.exports = router;
