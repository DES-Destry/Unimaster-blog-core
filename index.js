require('dotenv').config();

const express = require('express');
const app = express();

const config = require('./lib/config');
const handlers = require('./handlers/main');
const routers = require('./routers/main');

//All app.use(...); constructions
handlers.forEach(handler => handler(app));
//All API's routes
routers.forEach(router => router(app));

app.listen(config.port, () => {
    console.log(`Server has been started at ${config.port} port...`);
});