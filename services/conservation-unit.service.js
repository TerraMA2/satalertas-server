const {ConservationUnit} = require('../models');

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
    return await ConservationUnit.findAll(options);
}
