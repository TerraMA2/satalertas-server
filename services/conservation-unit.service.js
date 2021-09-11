const {ConservationUnit} = require('../models');
const {response} = require("../utils/response");

module.exports.get = async () => {
    const options = {
        attributes: [
            'gid',
            ['nome', 'name']
        ],
        order: [
            ['name']
        ]
    };
    const conservationUnits = await ConservationUnit.findAll(options);
    return response(200, conservationUnits);
}
