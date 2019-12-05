
const express = require('express')
        router = express.Router()
        geoserverController = require('../controllers/geoserver')

router.get('/insertLayers', geoserverController.insertLayers);
router.get('/updateLayers', geoserverController.updateLayers);
router.get('/deleteLayers', geoserverController.deleteLayers);

module.exports = router
