const config = require('./lib/config');
const mongo = require('./lib/mongo-config');
const app = require('./app');
const logger = require('./dev/logger');

// App startup
mongo('test', (err) => {
    if (err) throw err;

    app.listen(config.port, () => {
        const message = `Server has been started at ${config.port} port...`;

        console.log(message);
        logger.logInfo(message);
    });
});
