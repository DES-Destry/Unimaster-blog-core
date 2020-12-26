const router = require('express').Router();
const routes = require('../app/routes/api-authRoutes');

const path = '/api/auth';

routes(router);

module.exports = (app) => {
    app.use(path, router);
};
