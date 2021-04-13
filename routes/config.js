const express = require('express');
        router = express.Router();
        ConfigController = require('../controllers/config');

router.get('/getSynthesisConfig', ConfigController.getSynthesisConfig);
router.get('/getInfoColumns/:codGroup?', ConfigController.getInfoColumns);

module.exports = router;
