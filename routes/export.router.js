const express = require('express');
        router = express.Router();
        exportController = require('../controllers/export.controller');

router.get('/get?:fileFormats?:tableName', exportController.get);

module.exports = router;
