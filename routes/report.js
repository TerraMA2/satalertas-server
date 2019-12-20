const express = require('express');
        router = express.Router();
        reportController = require('../controllers/report');

router.post('/add', reportController.add);
router.get('/:id*?', reportController.get);
router.delete('/:id*?', reportController.delete);

module.exports = router;
