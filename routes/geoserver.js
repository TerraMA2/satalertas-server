
const express = require('express')
        router = express.Router()
        geoserverController = require('../controllers/geoserver')

router.get('/insertViewsFilter', geoserverController.insertViews);
router.get('/updateViewsFilter', geoserverController.updateViews);
router.delete('/deleteViews', geoserverController.deleteViews);
router.post('/saveViews', geoserverController.saveViews);
router.post('/saveGroupLayer', geoserverController.saveGroupLayer);
router.put('/updateDataStore', geoserverController.updateDataStore);
router.get('/updateAllDataStores', geoserverController.updateAllDataStores);


module.exports = router
