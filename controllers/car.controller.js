const carService = require(__dirname + '/../services/car.service');
const {response} = require("../utils/response.utils");
const httpStatus = require('../enum/http-status');

exports.get = async (req, res, next) => {
    try {
        const params = {
            specificParameters,
            date,
            filter
        } = req.query;

        const carResult = await carService.get(params)
        res.json(response(httpStatus.SUCCESS, carResult));
    } catch (e) {
        next(e)
    }
};
