const express = require('express');
        router = express.Router();
        biomeController = require('../controllers/biome.controller');

router.get('/getAll', biomeController.getAll);
router.get('/getAllSimplified', biomeController.getAllSimplified);

module.exports = router;
