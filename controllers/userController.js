const jwt = require('jsonwebtoken');
const { join, dirname } = require('path');

const User = require('../models/User');
const VerificationUser = require('../models/VerificationUser');
const config = require('../lib/config');
const { objects, validations, unknownError } = require('../lib/utils');

async function findUserByLogin(login) {
    // Users login can contain username or email
    const findedUserByEmail = await User.findOne({ email: login });
    const findedUserByUsername = await User.findOne({ username: login });

    // These two variables cannot be populated at the same time.
    // One of them is necessarily undefined.
    return findedUserByEmail ? findedUserByEmail : findedUserByUsername;
}

async function changeUsernameErrorsHandled(newUsername, currentUser, res) {
    const response = Object.create(objects.serverResponse);

    // If user not authenticated
    if (!currentUser) {
        response.success = false;
        response.msg = 'Current user not found';

        res.status(401).json(response);
        return true;
    }

    // The old and new username must be different
    if (currentUser.username === newUsername) {
        response.success = false;
        response.msg = 'The old and new username must be different';

        res.status(418).json(response);
        return true;
    }

    // Check user with current new username.
    // If user with this username already exists, return HTTP code 400
    const someUser = await User.findOne({ username: newUsername });
    if (someUser) {
        response.success = false;
        response.msg = 'The user with this username already exists';

        res.status(400).json(response);
        return true;
    }

    return false;
}

async function deleteUserErrorsHandled(findedUser, currentUser, password, res) {
    const response = Object.create(objects.serverResponse);

    if (currentUser._id !== findedUser._id || currentUser.privilege !== 'First Developer') {
        response.success = false;
        response.msg = 'Access denied';

        res.status(403).json(response);
        return true;
    }

    if (!findedUser || !findedUser.checkPass(password)) {
        response.success = false;
        response.msg = 'Users credentials not correct';

        res.status(401).json(response);
        return true;
    }

    return false;
}

module.exports = {
    async changeDescription(req, res) {
        const response = Object.create(objects.serverResponse);

        try {
            if (validations.validateInput(req, res)) return;

            const { newDescription, currentUser } = req.body;

            // If user not authenticated
            if (!currentUser) {
                response.success = false;
                response.msg = 'User credentials not correct';

                res.status(401).json(response);
                return;
            }

            await User.findByIdAndUpdate(currentUser._id,
                {
                    $set: { profileDescription: newDescription },
                });

            response.success = true;
            response.msg = 'Description updated';
            response.content = { newDescription };

            res.json(response);
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
            if (await changeUsernameErrorsHandled(newUsername, currentUser, res)) return;

            await User.findByIdAndUpdate(currentUser._id, { $set: { username: newUsername } });
            const newUser = await User.findById(currentUser._id);

            const { email, username } = newUser;
            const token = jwt.sign({ email, username }, config.jwtSecret);

            response.success = true;
            response.msg = 'Users username has been changed successful';
            response.content = { token };

            res.json(response);
        }
        catch (err) {
            unknownError(res, err);
        }
    },

    async verificateEmail(req, res) {
        const { code } = req.query;

        if (!code) {
            res.sendFile(join(dirname(__dirname), 'public', 'not_verified.html'));
            return;
        }
        const userToVerificate = await VerificationUser.findOne({ verificationCode: code }).populate('user');

        if (!userToVerificate || !userToVerificate.user) {
            res.sendFile(join(dirname(__dirname), 'public', 'not_verified.html'));
            return;
        }

        await User.findByIdAndUpdate(userToVerificate.user._id, {
            $set: {
                verified: true,
            },
        });
        await VerificationUser.findByIdAndDelete(userToVerificate._id);

        res.sendFile(join(dirname(__dirname), 'public', 'verified.html'));
    },

    async deleteUser(req, res) {
        const response = Object.create(objects.serverResponse);

        try {
            if (validations.validateInput(req, res)) return;

            const { login, password, currentUser } = req.body;
            const findedUser = await findUserByLogin(login);
            if (await deleteUserErrorsHandled(findedUser, currentUser, password, res)) return;

            // Delete from user database
            await User.findByIdAndDelete(findedUser._id);

            response.success = true;
            response.msg = 'User has been deleted';
            response.content = { deleted: findedUser };

            res.json(response);
        }
        catch (err) {
            unknownError(res, err);
        }
    },
};
