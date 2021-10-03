const AuthService = require("../services/auth.service");
const {response} = require("../utils/response.utils");
const httpStatus = require("../enum/http-status");

exports.login = async (req, res, next) => {
  try {
    const params = req.body.params;
    const {userName, password} = params;
    const userData = await AuthService.login(userName, password);
    res.json(response(httpStatus.SUCCESS, userData, 'Logged successful!'));
  } catch (e) {
    next(e)
  }
};
