const controller = require('../../controllers/userController');
const authController = require('../../controllers/authController');
const { validations } = require('../../lib/utils');

module.exports = (router) => {
    router.put('/description', validations.description, authController.auth, controller.changeDescription);
    router.put('/username', validations.username, controller.changeUsername);
}