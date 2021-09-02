const express = require('express');
router = express.Router();
projusController = require('../controllers/projus.controller');

router.get('/', projusController.getAll);

module.exports = router;
