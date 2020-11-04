const routes = require('../app/routes/api-authRoutes');
const router = require('express').Router();
const routerPath = '/api/auth';

routes(router);

module.exports = (app) => {
    app.use(routerPath, router);
}