const express = require('express')
        router = express.Router()
        viewController = require('../controllers/view')

router.get('/getByAnalysiName/:name?', viewController.getByAnalysiName)
router.get('/:id?', viewController.get)

module.exports = router
