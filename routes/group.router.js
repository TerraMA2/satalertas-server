const express = require('express');
        router = express.Router();
        GroupController = require('../controllers/group.controller');

router.delete('/:id', GroupController.deleteGroup);
router.put('/', GroupController.update);
router.post('/', GroupController.add);
router.get('/', GroupController.getAll);
router.get('/getCodGroups', GroupController.getCodGroups);
router.get('/getById?:id*', GroupController.getById);

module.exports = router;
