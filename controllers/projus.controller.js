const projusService = require(__dirname + '/../services/projus.service');
exports.get = async (req, res, next) => {
    try {
        res.json(await projusService.get());
    } catch (e) {
        next(e)
    }
};
