const countyService = require("../services/county.service");
const { response } = require("../utils/response.utils");
const httpStatus = require("../enum/http-status");
exports.getAllCounties = async (_req, res, next) => {
  try {
    const allCounties = await countyService.getAllCounties();
    res.json(response(httpStatus.SUCCESS, allCounties));
  } catch (e) {
    next(e);
  }
};
exports.getCountyData = async (req, res, next) => {
  try {
    const params = req.query;
    const allCounties = await countyService.getCountyData(params);
    res.json(response(httpStatus.SUCCESS, allCounties));
  } catch (e) {
    next(e);
  }
};
