const express = require('express');
router = express.Router();
indigenousLandController = require('../controllers/indigenous-land.controller');

router.get('/', indigenousLandController.getAll);

module.exports = router;
