const express = require('express');
const router = express.Router();
const groupController = require('../controllers/group.controller');

router.delete('/:id', groupController.deleteGroup);
router.put('/', groupController.update);
router.post('/', groupController.add);
router.get('/', groupController.get);
router.get('/getCodGroups', groupController.getCodGroups);
router.get('/getById?:id*', groupController.getById);

module.exports = router;
