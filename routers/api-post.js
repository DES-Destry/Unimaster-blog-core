const router = require('express').Router();
const routes = require('../app/routes/api-postRoutes');

const path = '/api/post';

routes(router);

module.exports = (app) => {
    app.use(path, router);
};
