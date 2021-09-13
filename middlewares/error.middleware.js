const {response} = require("../utils/response.utils");
const debug = require('debug')('satalertas-server:development')
const logger = require('../utils/logger.utils');

exports.errorHandling = (error, req, res, next) => {
    const message = error.message;
    let status = error.status;
    const stack = error.stack;
    if (!status) {
        status = 500;
    }
    debug(stack);
    logger.error(`${ status } - ${ message } - ${ stack }`);
    res.status(status).json(response(status, null, message))
}
