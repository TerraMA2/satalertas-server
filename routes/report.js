const express = require('express')
        router = express.Router()
        reportController = require('../controllers/report')

router.get('/add', reportController.add)

module.exports = router