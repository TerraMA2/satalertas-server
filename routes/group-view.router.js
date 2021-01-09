const express = require('express');
        router = express.Router();
        GroupViewController = require('../controllers/group-view.controller');

router.put('/', GroupViewController.update);
router.post('/', GroupViewController.add);
router.get('/', GroupViewController.getAll);
router.get('/getByIdGroup?:idGroup*', GroupViewController.getByIdGroup);
router.get('/getNotBelongingToTheGroup?:idGroup*', GroupViewController.getNotBelongingToTheGroup);
module.exports = router;
