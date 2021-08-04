const models = require('../models')
City = models.de_municipios_sema
logger = require('../utils/logger')

module.exports = cityService = {
    async getAll() {
        const options = {
            attributes: [
                'gid',
                ['municipio', 'name'],
                'geocodigo'
            ],
            order: [
                ['municipio']
            ]
        };
        try {
            return await City.findAll(options);
        } catch (e) {
            const msgErr = `In city.controller, method getAll:${e}`;
            logger.error(msgErr);
        }
    },
    async getAllRegions() {
        const options = {
            attributes: [
                ['comarca', 'name']
            ],
            group: 'comarca',
            order: [
                ['comarca']
            ]
        };
        try {
            return await City.findAll(options);
        } catch (e) {
            const msgErr = `In city.controller, method getAllRegions:${e}`;
            logger.error(msgErr);
        }
    },
    async getAllMesoregions() {
        const options = {
            attributes: [
                ['nm_meso', 'name']
            ],
            group: 'nm_meso',
            order: [
                ['nm_meso']
            ]
        };
        try {
            return await City.findAll(options);
        } catch (e) {
            const msgErr = `In city.controller, method getAllMesoregions:${e}`;
            logger.error(msgErr);
        }
    },
    async getAllImmediateRegion() {
        const options = {
            attributes: [
                ['nm_rgi', 'name']
            ],
            group: 'nm_rgi',
            order: [
                ['nm_rgi']
            ]
        };
        try {
            return await City.findAll(options);
        } catch (e) {
            const msgErr = `In city.controller, method getAllImmediateRegion:${e}`;
            logger.error(msgErr);
        }
    },
    async getAllIntermediateRegion() {
        const options = {
            attributes: [
                ['nm_rgint', 'name']
            ],
            group: 'nm_rgint',
            order: [
                ['nm_rgint']
            ]
        };
        try {
            return await City.findAll(options);
        } catch (e) {
            const msgErr = `In city.controller, method getAllIntermediateRegion:${e}`;
            logger.error(msgErr);
        }
    },
    async getAllPjbh() {
        const options = {
            attributes: [
                ['pjbh', 'name']
            ],
            group: 'pjbh',
            order: [
                ['pjbh']
            ]
        };
        try {
            return await City.findAll(options);
        } catch (e) {
            const msgErr = `In city.controller, method getAllPjbh:${e}`;
            logger.error(msgErr);
        }
    },
    async getAllMicroregions() {
        const options = {
            attributes: [
                ['nm_micro', 'name']
            ],
            group: 'nm_micro',
            order: [
                ['nm_micro']
            ]
        };
        try {
            return await City.findAll(options);
        } catch (e) {
            const msgErr = `In city.controller, method getAllMicroregions:${e}`;
            logger.error(msgErr);
        }
    }
};
