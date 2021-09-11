const biomeService = require(__dirname + '/../services/biome.service');

exports.get = async (req, res, next) => {
    try {
        res.json(await biomeService.get());
    } catch (e) {
        next(e);
    }
};
