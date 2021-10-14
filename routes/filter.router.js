const express = require('express');
const router = express.Router();
const filterController = require('../controllers/filter.controller');

router.get('/city', filterController.getCity);
router.get('/region', filterController.getCounty);
router.get('/mesoregion', filterController.getMesoregions);
router.get('/immediateRegion', filterController.getImmediateRegion);
router.get('/intermediateRegion', filterController.getIntermediateRegion);
router.get('/pjbh', filterController.getPjbh);
router.get('/microregion', filterController.getMicroregions);
router.get('/ti', filterController.getTI);
router.get('/uc', filterController.getUC);
router.get('/projus', filterController.getProjus);
router.get('/biome', filterController.getBiome);

module.exports = router;
