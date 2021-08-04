const models = require('../models')
const ConservationUnit = models.de_unidade_cons_sema
const logger = require('../utils/logger')

module.exports = conservationUnitService = {
    async getAll() {
        const options = {
            attributes: [
                'gid',
                ['nome', 'name']
            ],
            order: [
                ['name']
            ]
        };
        try {
            return await ConservationUnit.findAll(options);
        } catch (e) {
            const msgErr = `In conservation-unit.controller, method getAll:${e}`;
            logger.error(msgErr);
        }
    }
};
