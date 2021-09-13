const express = require('express');
const router = express.Router();
const GroupController = require('../controllers/group.controller');

router.delete('/:id', GroupController.deleteGroup);
router.put('/', GroupController.update);
router.post('/', GroupController.add);
router.get('/', GroupController.get);
router.get('/getCodGroups', GroupController.getCodGroups);
router.get('/getById?:id*', GroupController.getById);

module.exports = router;
