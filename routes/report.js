const express = require('express');
        router = express.Router();
        reportController = require('../controllers/report');

router.get('/newNumber/:type*?', reportController.newNumber);
router.get('/getReportsByCARCod/:carCode*?', reportController.getReportsByCARCod);
router.post('/add', reportController.upload);
router.get('/:id*?', reportController.get);
router.delete('/:id*?', reportController.delete);

module.exports = router;
