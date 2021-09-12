const SynthesisService = require("../services/synthesis.service");
const {response} = require("../utils/response");
const httpStatus = require('../enum/http-status');

exports.get = async (req, res, next) => {
    try {
        const synthesis = await SynthesisService.get(req.query);
        res.json(response(httpStatus.SUCCESS, synthesis));
    } catch (e) {
        next(e);
    }
};
