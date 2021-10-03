module.exports = class GeneralError extends Error {
  constructor(status, message) {
    super();
    this.status = status;
    this.message = message;
  }
}
