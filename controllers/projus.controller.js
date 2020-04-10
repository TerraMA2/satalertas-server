const   models = require('../models');
        Projus = models.de_projus_bacias_sema;

exports.getAll = async (req, res) => {

    try {
        res.json(await Projus.findAll());
    } catch (e) {
        res.json(e);
    }
};

exports.getAllSimplified = async (req, res) => {
    const options = {
        attributes: [
          'gid',
          ['promotoria', 'name']
        ],
        order: [
            ['name']
        ]
    };
    try {
        res.json(await Projus.findAll(options));
    } catch (e) {
        res.json(e);
    }
};
