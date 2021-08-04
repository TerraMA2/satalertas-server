const models = require('../models')
const Biome = models.de_biomas_mt;
const logger = require('../utils/logger')

module.exports = biomeService = {
    async getAll() {
        const options = {
            attributes: [
                'gid',
                'name'
            ],
            order: [
                ['name']
            ]
        };
        try {
            return await Biome.findAll(options);
        } catch (e) {
            const msgErr = `In conservation-unit.controller, method getAll:${e}`;
            logger.error(msgErr);
        }
    }
};
