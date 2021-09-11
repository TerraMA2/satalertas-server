const carService = require(__dirname + '/../services/car.service');

exports.get = async (req, res, next) => {
    try {
        const params = {
            specificParameters,
            date,
            filter
        } = req.query;

        res.json(await carService.get(params));
    } catch (e) {
        next(e)
    }
};
