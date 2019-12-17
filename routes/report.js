const express = require('express');
        router = express.Router();
        reportController = require('../controllers/report');

router.post('/add', reportController.add);
router.get('/:id*?', reportController.get);
router.post('/upload', reportController.upload);
router.delete('/:id*?', reportController.delete);

module.exports = router
