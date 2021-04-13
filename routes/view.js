const express = require('express')
        router = express.Router()
        viewController = require('../controllers/view')

router.get('/getSqlExport?:carRegister?:date?:filter', viewController.getSqlExport);
router.get('/getReportLayers', viewController.getReportLayers)
router.get('/getSidebarConfigDynamic', viewController.getSidebarConfigDynamic)
router.get('/:id?', viewController.get)

module.exports = router
