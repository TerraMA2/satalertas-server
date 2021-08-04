const express = require('express');
        router = express.Router();
        conservationUnitController = require('../controllers/conservation-unit.controller');

router.get('/', conservationUnitController.getAll);

module.exports = router;
