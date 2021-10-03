const conservationUnitService = require(__dirname + '/../services/conservation-unit.service');
const {response} = require("../utils/response.utils");
const httpStatus = require('../enum/http-status');

exports.get = async (req, res, next) => {
  try {
    const conservationUnits = await conservationUnitService.get()
    res.json(response(httpStatus.SUCCESS, conservationUnits));
  } catch (e) {
    next(e)
  }
};
