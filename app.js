const app = require('express')();

const handlers = require('./handlers/main');
const routers = require('./routers/main');

// All app.use(...); constructions
handlers.forEach((handler) => handler(app));
// All API's routes
routers.forEach((router) => router(app));

module.exports = app;
