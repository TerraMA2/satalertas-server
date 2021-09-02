const logger = require('./logger');
const { basename } = require('path')

exports.msgError = async (unit, method, e) => {
  const message = `In ${basename(unit)}, method ${method}:${e}`;
  logger.error(message)
  return message;
};
