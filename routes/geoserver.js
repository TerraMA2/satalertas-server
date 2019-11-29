
const express = require('express')
        router = express.Router()
        geoserverController = require('../controllers/geoserver')

router.get('/', geoserverController.get)

module.exports = router
