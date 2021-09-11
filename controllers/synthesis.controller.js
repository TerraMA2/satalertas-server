const SynthesisService = require("../services/synthesis.service");

exports.get = async (req, res, next) => {
    try {
        res.json(await SynthesisService.get(req.query));
    } catch (e) {
        next(e);
    }
};
