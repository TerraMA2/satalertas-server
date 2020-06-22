const express = require('express');
        router = express.Router();
        conservationUnitController = require('../controllers/conservation-unit.controller');

router.get('/getAll', conservationUnitController.getAll);
router.get('/getAllSimplified', conservationUnitController.getAllSimplified);

module.exports = router;
