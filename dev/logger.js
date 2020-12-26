const { createLogger, transports, format } = require('winston');

const logger = createLogger({
    level: 'info',
    format: format.json(),
    defaultMeta: { date: Date.now() },
    transports: [
        new transports.File({ filename: '../logs/error.log', level: 'error' }),
        new transports.File({ filename: '../logs/.log', level: 'info' }),
    ],
});

module.exports = {
    logError(err) {
        logger.log({
            level: 'error',
            message: err,
        });
    },

    logInfo(info) {
        logger.log({
            level: 'info',
            message: info,
        });
    },
};
