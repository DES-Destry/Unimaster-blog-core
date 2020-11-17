const { check } = require('express-validator');

module.exports.validations = {
    registration: [
        check('username', 'Username must be not empty').notEmpty(),
        check('username', 'Username must be not email').not().isEmail(),
        check('email', 'Wrong email form').isEmail().normalizeEmail(),
        check('password', 'Passwords length must be not less than 8 characters').isLength({ min: 8 })
    ],
    username: [],
    description: []
}