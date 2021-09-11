const {City} = require('../models');
const {response} = require("../utils/response");

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
    const cities = await City.findAll(options);
    return response(200, cities);
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
    const regions = await City.findAll(options);
    return response(200, regions);
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
    const mesoregions = await City.findAll(options);
    return response(200, mesoregions);
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
    const immediateRegions = await City.findAll(options);
    return response(200, immediateRegions);
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
    const intermediateRegions = await City.findAll(options);
    return response(200, intermediateRegions);
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
    const pjbhs = await City.findAll(options);
    return response(200, pjbhs);
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
    const microregions = await City.findAll(options);
    return response(200, microregions);
}
