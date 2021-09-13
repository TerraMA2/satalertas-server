const express = require('express');
router = express.Router();
classController = require('../controllers/class.controller');

router.get('/', classController.get);

module.exports = router;
