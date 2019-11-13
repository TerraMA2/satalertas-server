const express = require('express')
      router = express.Router()
      authController = require('../controllers/auth')

router.post('/login', authController.login)
router.post('/logout', authController.logout)

module.exports = router