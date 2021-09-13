const express = require('express');
router = express.Router();
satVeg = require('../controllers/sat-veg.controller');

router.get('/:type?/:coordinates?/:sat?/:preFilter?/:filter?/:filterParam?', satVeg.get);

module.exports = router;
