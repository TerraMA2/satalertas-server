const indigenousLandService = require(__dirname + '/../services/indigenous-land.service');
const {response} = require("../utils/response");
const httpStatus = require('../enum/http-status');

exports.get = async (req, res, next) => {
    try {
        const indigenousLands = await indigenousLandService.get();
        res.json(response(httpStatus.SUCCESS, indigenousLands));
    } catch (e) {
        next(e);
    }
};
