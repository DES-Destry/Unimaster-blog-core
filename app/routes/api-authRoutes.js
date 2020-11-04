const controller = require('../../controllers/authController');

module.exports = (router) => {
    router.get('/', controller.gay);
}