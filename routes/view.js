const express = require('express')
        router = express.Router()
        viewController = require('../controllers/view')

router.get('/getSidebarConfigDynamic', viewController.getSidebarConfigDynamic)
router.get('/:id?', viewController.get)

module.exports = router
