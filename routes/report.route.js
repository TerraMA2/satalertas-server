const express = require('express');
const router = express.Router();
const reportController = require('../controllers/report.controller');

router.get('/', reportController.get);
router.get('/getReport', reportController.getReport);
router.post('/generatePdf', reportController.generatePdf);
router.get('/getNDVI?:carGid?:date?:filter?:type', reportController.getNDVI);

module.exports = router;
