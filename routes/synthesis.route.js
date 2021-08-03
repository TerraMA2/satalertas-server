const express = require('express');
const router = express.Router();
const SynthesisController = require('../controllers/synthesis.controller');

router.post('/getSynthesis?:carRegister?:date?:formattedFilterDate?:synthesisConfig', SynthesisController.getSynthesis);

module.exports = router;
