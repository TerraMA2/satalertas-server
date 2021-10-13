const express = require('express');
const router = express.Router();
const biomeController = require('../controllers/biome.controller');

router.get('/', biomeController.get);

module.exports = router;
