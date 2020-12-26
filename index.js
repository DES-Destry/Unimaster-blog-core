require('dotenv').config();

const app = require('express')();

const config = require('./lib/config');
const mongo = require('./lib/mongo-config');
const handlers = require('./handlers/main');
const routers = require('./routers/main');

// All app.use(...); constructions
handlers.forEach((handler) => handler(app));
// All API's routes
routers.forEach((router) => router(app));

mongo((err) => {
    if (err) throw err;

    app.listen(config.port, () => {
        console.log(`Server has been started at ${config.port} port...`);
    });
});
