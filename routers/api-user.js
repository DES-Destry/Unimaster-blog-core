const router = require('express').Router();
const routes = require('../app/routes/api-userRoutes');

const path = '/api/user';

routes(router);

module.exports = (app) => {
    app.use(path, router);
};
