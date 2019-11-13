const express = require('express')
      router = express.Router()
      userController = require('../controllers/user')

router.get('/:id*?', userController.get)
router.post('/:id*?', userController.addUpdate)
router.delete('/:id', userController.delete)

module.exports = router