const createError = require('http-errors')
      logger = require('../utils/logger')

exports.showError = (err, req, res, next) => {
    let message = err.message
    let status = err.status
    logger.error(status + " - " + message)
    res.json({
        'error-status': `${status}`,
        'error-message': `${message}`
    })
}

exports.show404 = (req, res, next) => {
    next(createError(404, "Page not found"))
}

exports.show500 = (req, res, next) => {
    next(createError(500, "Internal server error"))
}