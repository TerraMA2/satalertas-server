const express = require('express');
        router = express.Router();
        cityController = require('../controllers/city.controller');

router.get('/getAll', cityController.getAll);
router.get('/getAllSimplified', cityController.getAllSimplified);
router.get('/getAllRegions', cityController.getAllRegions);
router.get('/getAllMesoregions', cityController.getAllMesoregions);
router.get('/getAllMicroregions', cityController.getAllMicroregions);

module.exports = router;
