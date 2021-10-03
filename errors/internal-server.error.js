const GeneralError = require("./general.error");
const httpStatus = require('../enum/http-status');

module.exports = class InternalServerError extends GeneralError {
  constructor(message) {
    super(httpStatus.INTERNAL_SERVER_ERROR, message);
  }
}
