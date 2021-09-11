const GeneralError = require("./general.error");
const httpStatus = require('../enum/http-status');

module.exports = class BadRequestError extends GeneralError {
    constructor(message) {
        super(httpStatus.BAD_REQUEST, message);
    }
}
