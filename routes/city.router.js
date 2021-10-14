const express = require('express');
const router = express.Router();
const cityController = require('../controllers/city.controller');
const countyController = require('../controllers/county.controller');

router.get('/', cityController.get);
router.get('/getRegions', countyController.getAllCounties);
router.get('/getMesoregions', cityController.getMesoregions);
router.get('/getImmediateRegion', cityController.getImmediateRegion);
router.get('/getIntermediateRegion', cityController.getIntermediateRegion);
router.get('/getPjbh', cityController.getPjbh);
router.get('/getMicroregions', cityController.getMicroregions);

module.exports = router;
