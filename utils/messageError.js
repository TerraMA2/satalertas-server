const logger = require('./logger');

exports.msgError =  async (unit, method, e) => {
  const message = `In ${unit}, method ${method}: ${e}`;
  logger.error(message)
  return message;
};
