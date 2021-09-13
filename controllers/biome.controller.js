const biomeService = require(__dirname + '/../services/biome.service');
const {response} = require("../utils/response.utils");
const httpStatus = require('../enum/http-status');

exports.get = async (req, res, next) => {
    try {
        const biomes = await biomeService.get();
        res.json(response(httpStatus.SUCCESS, biomes));
    } catch (e) {
        next(e);
    }
};
