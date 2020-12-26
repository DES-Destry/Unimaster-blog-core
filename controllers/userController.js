const jwt = require('jsonwebtoken');

const User = require('../models/User');
const config = require('../lib/config');
const { objects, validations, unknownError } = require('../lib/utils');

module.exports = {
    async changeDescription(req, res) {
        const response = Object.create(objects.serverResponse);

        try {
            if (validations.validateInput(req, res)) return;

            const { newDescription, currentUser } = req.body;

            // If user exists in session
            if (currentUser) {
                await User.findByIdAndUpdate(currentUser._id,
                    {
                        $set: { profileDescription: newDescription },
                    });

                response.msg = 'Description updated';
                response.content = { newDescription };

                res.json(response);
            }

            response.success = false;
            response.msg = 'Current user not found';

            res.status(401).json(response);
        }
        catch (err) {
            unknownError(res, err);
        }
    },

    async changeUsername(req, res) {
        const response = Object.create(objects.serverResponse);

        try {
            if (validations.validateInput(req, res)) return;

            const { newUsername, currentUser } = req.body;

            // If user exists in session
            if (currentUser) {
                // The old and new username must be different
                if (currentUser.username === newUsername) {
                    response.success = false;
                    response.msg = 'The old and new username must be different';

                    res.status(400).json(response);
                    return;
                }

                // Check user with current new username.
                // If user with this username already exists, return HTTP code 400
                const someUser = await User.findOne({ username: newUsername });
                if (someUser) {
                    response.success = false;
                    response.msg = 'The user with this username already exists';

                    res.status(400).json(response);
                    return;
                }

                await User.findByIdAndUpdate(currentUser._id, { $set: { username: newUsername } });
                const newUser = await User.findById(currentUser._id);

                const { email, username } = newUser;
                const token = jwt.sign({ email, username }, config.jwtSecret);

                response.success = true;
                response.msg = 'Users username has been changed successful';
                response.content = { ...newUser._doc, ...{ token } };
                delete response.content.hPassword;

                res.json(response);
            }

            response.success = false;
            response.msg = 'Current user not found';

            res.status(401).json(response);
        }
        catch (err) {
            unknownError(res, err);
        }
    },

    async deleteUser(req, res) {
        const response = Object.create(objects.serverResponse);

        try {
            if (validations.validateInput(req, res)) return;

            const { login, password } = req.body;

            // Users login can contain username or email
            const findedUserByEmail = await User.findOne({ email: login });
            const findedUserByUsername = await User.findOne({ username: login });

            // These two variables cannot be populated at the same time.
            // One of them is necessarily undefined.
            if (findedUserByEmail || findedUserByUsername) {
                const findedUser = findedUserByEmail ? findedUserByEmail : findedUserByUsername;

                if (findedUser.checkPass(password)) {
                    // Delete from user database
                    await User.findByIdAndDelete(findedUser._id);

                    response.msg = 'User has been deleted';
                    response.content = { deleted: findedUser };

                    res.json(response);
                }

                response.success = false;
                response.msg = 'Incorrect password';

                res.status(401).json(response);
            }

            response.success = false;
            response.msg = 'User with this email or username not exists';

            res.status(401).json(response);
        }
        catch (err) {
            unknownError(res, err);
        }
    },
};
