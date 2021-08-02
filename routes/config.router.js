const express = require('express');
        router = express.Router();
        ConfigController = require('../controllers/config.controller');

router.get('/getInfoColumns/:viewId?', ConfigController.getInfoColumns);

module.exports = router;
