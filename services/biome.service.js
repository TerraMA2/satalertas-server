const {Biome} = require('../models');
const {response} = require("../utils/response");

exports.get = async () => {
    const options = {
        attributes: ['gid', 'name'],
        order: [['name']],
    };
    const biomes = await Biome.findAll(options);
    return response(200, biomes);
};
