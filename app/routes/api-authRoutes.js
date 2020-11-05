const controller = require('../../controllers/authController');
const { check } = require('express-validator');

const regValidate = [
    check('username', 'Username must be not empty').notEmpty(),
    check('email', 'Wrong email form').isEmail().normalizeEmail(),
    check('password', 'Passwords length must be not less than 8 characters').isLength({ min: 8 })
]

module.exports = (router) => {
    router.post('/registrate', regValidate, controller.registration);
}