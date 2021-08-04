const carService = require(__dirname + '/../services/car.service');

exports.getAll = async (req, res) => {
    const params = {
        specificParameters,
        date,
        filter
    } = req.query;

    try {
        res.json(await carService.getAll(params));
    } catch (e) {
        res.json(e);
    }
};

exports.getByCpf = async (req, res) => {

    try {
        res.json(await carService.getByCpf(req.query.cpfCnpj));
    } catch (e) {
        res.json(e);
    }
};
