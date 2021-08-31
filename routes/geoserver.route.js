const express = require('express')
        router = express.Router()
        geoserverController = require('../controllers/geoserver.controller')

router.get('/configGeoserver', geoserverController.configGeoserver);
router.post('/addUpdateFilterLayers', geoserverController.addUpdateFilterLayers);

module.exports = router
