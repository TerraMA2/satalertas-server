const express = require('express');
router = express.Router();
InfoColumnsController = require('../controllers/info-columns.controller');

router.get('/:viewId?', InfoColumnsController.getInfoColumns);

module.exports = router;
