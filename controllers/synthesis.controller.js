const SynthesisService = require("../services/synthesis.service");

exports.getSynthesis = async (req, res) => {
    res.json(await SynthesisService.getSynthesis(req.query));
};
