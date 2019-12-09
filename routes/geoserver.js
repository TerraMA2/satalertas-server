
const express = require('express')
        router = express.Router()
        geoserverController = require('../controllers/geoserver')

router.get('/insertViewsFilter', geoserverController.insertViews);
router.get('/updateViewsFilter', geoserverController.updateViews);
router.delete('/deleteViews', geoserverController.deleteViews);
router.post('/saveViews', geoserverController.saveViews);

module.exports = router
