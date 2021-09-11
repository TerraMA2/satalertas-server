const indigenousLandService = require(__dirname + '/../services/indigenous-land.service');
exports.get = async (req, res, next) => {
    try {
        res.json(await indigenousLandService.get());
    } catch (e) {
        next(e);
    }
};
