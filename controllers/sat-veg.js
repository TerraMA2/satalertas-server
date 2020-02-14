const axios = require('axios');
const Result = require(__dirname + '/../utils/result');


exports.get = async (req, res) => {

    const coordinates = JSON.parse(req.query.coordinates)

    const CHAVE = 'ZW46IXzr4pRzJlX/';
    const type = req.query.type ? `${req.query.type}/`: `ndvi/`;
    const spot = `ponto/${coordinates.long}/${coordinates.lat}/`;
    const sat = req.query.sat ? `${req.query.sat}/` : 'comb/';
    const preFilter = req.query.preFilter === 'null' ? '0/' : `${req.query.preFilter}/`;
    const filter = req.query.filter === 'null' ? '' : `${req.query.filter}/`;
    const filterParam = req.query.filterParam === 'null' ? '' : `${req.query.filterParam}`;


    try {
        const url = `https://www.satveg.cnptia.embrapa.br/satvegws/ws/perfil/${CHAVE}${type}${spot}${sat}${preFilter}${filter}${filterParam}`;

        const response = await axios['get'](url).then(resp => resp).catch(err => err);
        res.json(Result.ok(response.data));
    } catch (e) {
        res.json(Result.err(e));
    }
};
