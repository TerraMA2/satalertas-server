const ClassService = require("../services/class.service");
const {response} = require("../utils/response.utils");
const httpStatus = require('../enum/http-status');

exports.get = async (req, res, next) => {
    try {
        const {type} = req.query;
        const classes = await ClassService.get(type);
        res.json(response(httpStatus.SUCCESS, classes));
    } catch (e) {
        next(e)
    }
};
