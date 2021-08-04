const models = require('../models');
const Projus = models.de_projus_bacias_sema;
const logger = require('../utils/logger');

module.exports = projusService = {
    async getAll() {
        const options = {
            attributes: [
                'gid',
                ['promotoria', 'name']
            ],
            order: [
                ['promotoria']
            ]
        };
        try {
            return await Projus.findAll(options);
        } catch (e) {
            const msgErr = `In projus.controller, method getAll:${e}`;
            logger.error(msgErr);
        }
    }
};
