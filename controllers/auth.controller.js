const AuthService = require("../services/auth.service");

exports.login = async (req, res) => {
    res.json(await AuthService.login(req, res));
};
