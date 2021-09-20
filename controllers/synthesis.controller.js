const synthesisService = require("../services/synthesis.service");
const {response} = require("../utils/response.utils");
const httpStatus = require('../enum/http-status');

exports.get = async (req, res, next) => {
    try {
        const {carRegister, date} = req.query;
        const synthesis = await synthesisService.get(carRegister, date);
        res.json(response(httpStatus.SUCCESS, synthesis));
    } catch (e) {
        next(e);
    }
};
