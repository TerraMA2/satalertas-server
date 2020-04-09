const express = require('express');
        router = express.Router();
        conservationUnitController = require('../controllers/conservationUnit.controller');

router.get('/getAll', conservationUnitController.getAll);
router.get('/getAllSimplified', conservationUnitController.getAllSimplified);

module.exports = router;
