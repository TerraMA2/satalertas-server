const express = require('express');
const router = express.Router();
const countyController = require('../controllers/county.controller');

router.get('/', countyController.getAllCounties);
router.get('/countyData', countyController.getCountyData);

module.exports = router;
