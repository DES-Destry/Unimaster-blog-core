const router = require('express').Router();
const path = '/api/user'

const routes = require('../app/routes/api-userRoutes');

routes(router);

module.exports = (app) => {
    app.use(path, router);
}