const express = require('express');
router = express.Router();
exportController = require('../controllers/export.controller');

router.post('/', exportController.get);

module.exports = router;
