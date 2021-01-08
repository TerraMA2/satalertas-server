const express = require('express');
        router = express.Router();
        GroupController = require('../controllers/group.controller');

router.get('/getAll', GroupController.getAll);
router.get('/getById?:id*', GroupController.getById);

module.exports = router;
