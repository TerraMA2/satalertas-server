const SatVegService = require(__dirname + '/../services/sat-veg.service');

exports.get = async (req, res, next) => {
    try {
        const {
            coordinates,
            type,
            preFilter,
            filter,
            filterParam,
            sat
        } = req.query;
        res.json(await SatVegService.get(
                coordinates,
                type,
                preFilter,
                filter,
                filterParam,
                sat
            )
        );
    } catch (e) {
        next(e)
    }
};
