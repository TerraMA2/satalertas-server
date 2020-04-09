const express = require('express');
        router = express.Router();
        projusController = require('../controllers/projus.controller');

router.get('/getAll', projusController.getAll);
router.get('/getAllSimplified', projusController.getAllSimplified);

module.exports = router;
