const express = require('express');
router = express.Router();
projusController = require('../controllers/projus.controller');

router.get('/', projusController.get);

module.exports = router;
