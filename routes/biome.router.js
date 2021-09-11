const express = require('express');
router = express.Router();
biomeController = require('../controllers/biome.controller');

router.get('/', biomeController.get);

module.exports = router;
