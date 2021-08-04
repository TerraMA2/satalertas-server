const express = require('express');
        router = express.Router();
        cityController = require('../controllers/city.controller');

router.get('/', cityController.getAll);
router.get('/getAllRegions', cityController.getAllRegions);
router.get('/getAllMesoregions', cityController.getAllMesoregions);
router.get('/getAllImmediateRegion', cityController.getAllImmediateRegion);
router.get('/getAllIntermediateRegion', cityController.getAllIntermediateRegion);
router.get('/getAllPjbh', cityController.getAllPjbh);
router.get('/getAllMicroregions', cityController.getAllMicroregions);

module.exports = router;
