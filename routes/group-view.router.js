const express = require('express');
const router = express.Router();
const GroupViewController = require('../controllers/group-view.controller');

router.put('/', GroupViewController.update);
router.put('/advanced', GroupViewController.updateAdvanced);
router.post('/', GroupViewController.add);
router.get('/', GroupViewController.getAll);
router.get('/getBygroupId?:groupId*', GroupViewController.getByGroupId);
router.get('/getAvailableLayers?:groupId*', GroupViewController.getAvailableLayers);
module.exports = router;
