const projusService = require(__dirname + '/../services/projus.service');
const {response} = require("../utils/response.utils");
const httpStatus = require('../enum/http-status');

exports.get = async (req, res, next) => {
  try {
    const projus = await projusService.get();
    res.json(response(httpStatus.SUCCESS, projus));
  } catch (e) {
    next(e)
  }
};
