const passport = require('passport');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');

const User = require('../models/User');
const config = require('../lib/config');
const { objects } = require('../lib/utils');

function validateErrors(req, res) {
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
}

module.exports = {
    auth(req, res, next) {
        const response = Object.create(objects.serverResponse);

        // Authentication with passport-jwt
        passport.authenticate('jwt', { session: false }, (err, user) => {
            if (err) {
                response.success = false;
                response.msg = 'Unknown authenticate error';

                return res.status(500).json(response);
            }

            if (user) {
                req.body.currentUser = user;
                return next();
            }

            response.success = false;
            response.msg = 'Users data is not correct';

            return res.status(401).json(response);
        })(req, res, next);
    },

    async registration(req, res) {
        const response = Object.create(objects.serverResponse);

        try {
            // Validate user input
            if (validateErrors(req, res)) return;

            const { username, email, password } = req.body;

            // If such user already exist we can't create new user
            const userByEmail = await User.findOne({ email });
            const userByUsername = await User.findOne({ username });

            if (userByEmail || userByUsername) {
                response.success = false;
                response.msg = 'User with this email already exists';

                res.status(403).json(response);
                return;
            }

            // Create new user
            const createdUser = new User({ username, email, password });

            // Generate token and save user
            const token = jwt.sign({ email, username }, config.jwtSecret);
            createdUser.save();

            // Form a JSON for send to the client. It contains jwt and user data without password
            response.msg = 'User has been created';
            response.content = { ...createdUser._doc, ...{ token } };
            delete response.content.hPassword;

            res.json(response);
        }
        catch (err) {
            response.success = false;
            response.msg = err.message;
            response.content = err;

            res.status(500).json(response);
        }
    },

    async login(req, res) {
        const response = Object.create(objects.serverResponse);

        try {
            const { login, password } = req.body;

            // Users login can contain username or email
            const findedUserByEmail = await User.findOne({ email: login });
            const findedUserByUsername = await User.findOne({ username: login });

            // These two variables cannot be populated at the same time.
            // One of them is necessarily undefined.
            if (findedUserByEmail || findedUserByUsername) {
                const findedUser = findedUserByEmail ? findedUserByEmail : findedUserByUsername;

                if (findedUser.checkPass(password)) {
                    // Generate token for sending
                    const { email, username } = findedUser;
                    const token = jwt.sign({ email, username }, config.jwtSecret);

                    // Form a JSON for send to the client.
                    // It contains jwt and user data without password
                    response.success = true;
                    response.msg = 'Loging in has been successful';
                    response.content = {
                            ...findedUser._doc,
                            ...{ token },
                    };
                    delete response.content.hPassword;

                    return res.json(response);
                }

                response.success = false;
                response.msg = 'Incorrect user credentials';
                return res.status(401).json(response);
            }

            response.success = false;
            response.msg = 'Incorrect user credentials';
            return res.status(401).json(response);
        }
        catch (err) {
            response.success = false;
            response.msg = err.message;
            response.content = err;

            return res.status(500).json(response);
        }
    },
};
