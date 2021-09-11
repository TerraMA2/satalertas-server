const AuthService = require("../services/auth.service");

exports.login = async (req, res, next) => {
    try {
        const params = req.body.params;
        const {userName, password} = params;
        res.json(await AuthService.login(userName, password));
    } catch (e) {
        next(e)
    }
};
