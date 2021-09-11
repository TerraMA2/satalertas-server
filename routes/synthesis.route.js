const express = require('express');
const router = express.Router();
const SynthesisController = require('../controllers/synthesis.controller');

router.get('/', SynthesisController.get);

module.exports = router;
