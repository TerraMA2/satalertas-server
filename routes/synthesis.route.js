const express = require('express');
const router = express.Router();
const synthesisController = require('../controllers/synthesis.controller');

router.get('/', synthesisController.get);

module.exports = router;
