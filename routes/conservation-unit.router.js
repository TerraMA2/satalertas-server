const express = require('express');
router = express.Router();
conservationUnitController = require('../controllers/conservation-unit.controller');

router.get('/', conservationUnitController.get);

module.exports = router;
