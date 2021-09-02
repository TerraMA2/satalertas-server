const axios = require('axios')
logger = require('../utils/logger');

module.exports = SatVegService = {
    async get(coordinates, type, preFilter, filter, filterParam, sat) {

        const CHAVE = 'ZW46IXzr4pRzJlX/';

        type = type ? `${ type }/` : `ndvi/`;
        const spot = `ponto/${ coordinates.long }/${ coordinates.lat }/`;
        sat = sat ? `${ sat }/` : 'comb/';
        preFilter = preFilter === 'null' ? '0/' : `${ preFilter }/`;
        filter = filter === 'null' ? '' : `${ filter }/`;
        filterParam = filterParam === 'null' ? '' : `${ filterParam }`;

        try {
            const url = `https://www.satveg.cnptia.embrapa.br/satvegws/ws/perfil/${ CHAVE }${ type }${ spot }${ sat }${ preFilter }${ filter }${ filterParam }`;

            const response = await axios['get'](url).then(resp => resp).catch(err => err);
            return await response.data;
        } catch (e) {
            const msgErr = `In unit sat-veg.service, method get:${ e }`;
            logger.error(msgErr);
            throw new Error(msgErr);
        }
    }
};
