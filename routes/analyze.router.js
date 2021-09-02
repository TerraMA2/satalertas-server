const express = require('express');
router = express.Router();
analyzeController = require('../controllers/analyze.controller');

router.get('/getAllClassByType?:type', analyzeController.getAllClassByType);

module.exports = router;
