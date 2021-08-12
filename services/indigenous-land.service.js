const models = require('../models')
const IndigenousLand = models.de_terra_indigena_sema;
const logger = require('../utils/logger')

module.exports = indigenousLandService = {
    async getAll() {
        const options = {
            attributes: [
                'gid',
                ['nome', 'name'],
                'nome_ti_a1'
            ],
            order: [
                ['name']
            ]
        };
        try {
            return await IndigenousLand.findAll(options);
        } catch (e) {
            const msgErr = `In conservation-unit.controller, method getAll:${e}`;
            logger.error(msgErr);
        }
    }
};