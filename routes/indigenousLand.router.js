const express = require('express');
        router = express.Router();
        indigenousLandController = require('../controllers/indigenousLand.controller');

router.get('/getAll', indigenousLandController.getAll);
router.get('/getAllSimplified', indigenousLandController.getAllSimplified);

module.exports = router;
