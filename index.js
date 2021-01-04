require('dotenv').config();

const app = require('express')();

const config = require('./lib/config');
const mongo = require('./lib/mongo-config');
const handlers = require('./handlers/main');
const routers = require('./routers/main');
const logger = require('./dev/logger');

// All app.use(...); constructions
handlers.forEach((handler) => handler(app));
// All API's routes
routers.forEach((router) => router(app));

mongo((err) => {
    if (err) throw err;

    app.listen(config.port, () => {
        const message = `Server has been started at ${config.port} port...`;

        console.log(message);
        logger.logInfo(message);
    });
});

//Use only for integrated test of app's endpoints
module.exports.testInstance = app;
