const express = require('express');
router = express.Router();
carController = require('../controllers/car.controller');

router.get('/', carController.get);

module.exports = router;
