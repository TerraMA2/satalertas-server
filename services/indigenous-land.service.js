const {IndigenousLand} = require('../models')
const {response} = require("../utils/response");

module.exports.get = async () => {
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
    const indigenousLands = await IndigenousLand.findAll(options);
    return response(200, indigenousLands);
}
