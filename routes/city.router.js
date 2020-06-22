const express = require('express');
        router = express.Router();
        cityController = require('../controllers/city.controller');

router.get('/getAll', cityController.getAll);
router.get('/getAllSimplified', cityController.getAllSimplified);
router.get('/getAllRegionsSimplified', cityController.getAllRegionsSimplified);
router.get('/getAllMesoregionsSimplified', cityController.getAllMesoregionsSimplified);
router.get('/getAllMicroregionsSimplified', cityController.getAllMicroregionsSimplified);

module.exports = router;
