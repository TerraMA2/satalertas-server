const {Projus} = require('../models');
const {response} = require("../utils/response");

module.exports.get = async () => {
    const options = {
        attributes: ['gid', ['promotoria', 'name']],
        order: [['promotoria']],
    };
    const projus = await Projus.findAll(options);
    return response(200, projus);
}
