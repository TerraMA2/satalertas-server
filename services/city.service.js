const {City} = require('../models');

module.exports.get = async () => {
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
    return await City.findAll(options);
}
module.exports.getRegions = async () => {
    const options = {
        attributes: [
            ['comarca', 'name']
        ],
        group: 'comarca',
        order: [
            ['comarca']
        ]
    };
    return await City.findAll(options);
}
module.exports.getMesoregions = async () => {
    const options = {
        attributes: [
            ['nm_meso', 'name']
        ],
        group: 'nm_meso',
        order: [
            ['nm_meso']
        ]
    };
    return await City.findAll(options);
}
module.exports.getImmediateRegion = async () => {
    const options = {
        attributes: [
            ['nm_rgi', 'name']
        ],
        group: 'nm_rgi',
        order: [
            ['nm_rgi']
        ]
    };
    return await City.findAll(options);
}
module.exports.getIntermediateRegion = async () => {
    const options = {
        attributes: [
            ['nm_rgint', 'name']
        ],
        group: 'nm_rgint',
        order: [
            ['nm_rgint']
        ]
    };
    return await City.findAll(options);
}
module.exports.getPjbh = async () => {
    const options = {
        attributes: [
            ['pjbh', 'name']
        ],
        group: 'pjbh',
        order: [
            ['pjbh']
        ]
    };
    return await City.findAll(options);
}
module.exports.getMicroregions = async () => {
    const options = {
        attributes: [
            ['nm_micro', 'name']
        ],
        group: 'nm_micro',
        order: [
            ['nm_micro']
        ]
    };
    return await City.findAll(options);
}
