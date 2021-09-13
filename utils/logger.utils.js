'use strict';
const {createLogger, format, transports} = require('winston');
const fs = require('fs')

require('winston-daily-rotate-file');

const env = process.env.NODE_ENV || 'development';
const logDir = 'logs';

if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, {recursive: true});
}

const dailyRotateFileTransport = new transports.DailyRotateFile({
    filename: `${ logDir }/%DATE%.log`,
    datePattern: 'DD-MM-YYYY'
});

const logger = createLogger({
    level: env === 'development' ? 'verbose' : 'info',
    format: format.combine(
        format.timestamp({
            format: 'DD-MM-YYYY HH:mm:ss'
        }),
        format.printf(info => `${ info.timestamp } ${ info.level }: ${ info.message }`)
    ),
    transports: [
        new transports.Console({
            level: 'info',
            format: format.combine(
                format.colorize(),
                format.printf(
                    info => `${ info.timestamp } ${ info.level }: ${ info.message }`
                )
            )
        }),
        dailyRotateFileTransport
    ]
});
// logger.debug('Debugging info');
// logger.verbose('Verbose info');
// logger.info('Info');
// logger.warn('Warning message');
// logger.error('Error info');
module.exports = logger;