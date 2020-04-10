const   models = require('../models');
        Biome = models.de_biomas_mt;

exports.getAll = async (req, res) => {

    try {
        res.json(await Biome.findAll());
    } catch (e) {
        res.json(res.err(e));
    }
};

exports.getAllSimplified = async (req, res) => {
    const options = {
        attributes: [
          'gid',
          'name'
        ],
        order: [
            ['name']
        ]
    };
    try {
        res.json(await Biome.findAll(options));
    } catch (e) {
        res.json(res.err(e));
    }
};
