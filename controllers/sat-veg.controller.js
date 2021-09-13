const SatVegService = require(__dirname + '/../services/sat-veg.service');
const {response} = require("../utils/response.utils");
const httpStatus = require('../enum/http-status');

exports.get = async (req, res, next) => {
    try {
        const {
            coordinates,
            type,
            preFilter,
            filter,
            filterParam,
            sat
        } = req.query;

        const satVegs =  await SatVegService.get(
            coordinates,
            type,
            preFilter,
            filter,
            filterParam,
            sat
        );

        res.json(response(httpStatus.SUCCESS, satVegs));
    } catch (e) {
        next(e)
    }
};
