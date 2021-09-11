const ClassService = require("../services/class.service");

exports.get = async (req, res, next) => {
    try {
        const {type} = req.query;
        res.json(await ClassService.get(type));
    } catch (e) {
        next(e)
    }
};
