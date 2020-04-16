const SatVegService = require(__dirname + '/../services/car.service');


exports.get = async (req, res) => {
    try {
        res.json(await SatVegService.get(JSON.parse(
          req.query.coordinates,
          req.query.type,
          req.query.preFilter,
          req.query.filter,
          req.query.filterParam,
          req.query.sat))
        );
    } catch (e) {
        res.json(e);
    }
};
