
const express = require('express');
        router = express.Router();
        fileController = require('../controllers/file');

router.get('/:id*?', fileController.get);
router.post('/upload', fileController.upload);
router.delete('/:id*?', fileController.delete);

module.exports = router
