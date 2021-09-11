const conservationUnitService = require(__dirname + '/../services/conservation-unit.service');

exports.get = async (req, res, next) => {
    try {
        res.json(await conservationUnitService.get());
    } catch (e) {
        next(e)
    }
};
