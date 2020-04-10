const   models = require('../models');
        ConservationUnit = models.de_unidade_cons_sema;

exports.getAll = async (req, res) => {
    try {
        res.json(await ConservationUnit.findAll());
    } catch (e) {
      const msgErr = `In conservation-unit.controller, method getAll:${e}`;
      console.log(msgErr);
      res.json(msgErr);
    }
};

exports.getAllSimplified = async (req, res) => {
    const options = {
      attributes: [
        'gid',
        ['nome', 'name']
      ],
      order: [
        ['name']
      ]
    };
    try {
        res.json(await ConservationUnit.findAll(options));
    } catch (e) {
      const msgErr = `In conservation-unit.controller, method getAllSimplified:${e}`;
      console.log(msgErr);
      res.json(msgErr);
    }
};
