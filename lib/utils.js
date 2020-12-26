const { check, validationResult } = require('express-validator');

const objects = {
    serverResponse: {
        success: false,
        msg: '',
        content: {},
    },
};

module.exports.validations = {
    validateInput(req, res) {
        const response = Object.create(objects.serverResponse);

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            response.success = false;
            response.msg = 'Validation error';
            response.content = errors.array();

            res.status(400).json(response);
            return true;
        }

        return false;
    },
    registration: [
        check('username', 'Username must be not empty').notEmpty(),
        check('username', 'Username must be not email').not().isEmail(),
        check('email', 'Wrong email form').isEmail().normalizeEmail(),
        check('password', 'Passwords length must be not less than 8 characters').isLength({ min: 8 }),
    ],
    username: [
        check('newUsername', 'Username must be not empty').notEmpty(),
        check('newUsername', 'Username must be not email').not().isEmail(),
    ],
    description: [
        check('newDescription', 'New description must be not less than 10 symbols').isLength({ min: 10 }),
        check('newDescription', 'New description must be not longer than 5000 symbols').isLength({ max: 5000 }),
    ],
};

module.exports.objects = objects;

module.exports.unknownError = function unknownError(res, err) {
    const response = Object.create(objects.serverResponse);

    response.success = false;
    response.msg = err.message;
    response.content = err;

    res.status(500).json(response);
};
