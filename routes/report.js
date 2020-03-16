const express = require('express');
        router = express.Router();
        reportController = require('../controllers/report');

router.post('/createPdf', reportController.createPdf);
router.get('/getReportCarData?:carRegister?:date?:filter?:type', reportController.getReportCarData);
router.get('/getPointsAlerts?:carRegister?:date?:filter?:type', reportController.getPointsAlerts);
router.get('/getSynthesisCarData?:carRegister?:date?:filter', reportController.getSynthesisCarData);
router.get('/getReportsByCARCod?:carCode', reportController.getReportsByCARCod);
router.get('/newNumber?:type', reportController.newNumber);
router.post('/add', reportController.upload);
router.post('/generatePdf', reportController.generatePdf);
router.delete('/:id*?', reportController.delete);
router.get('/:id*?', reportController.get);

module.exports = router;
