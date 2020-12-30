const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const { join, dirname } = require('path');

const User = require('../models/User');
const VerificationUser = require('../models/VerificationUser');
const config = require('../lib/config');
const { objects, validations, unknownError } = require('../lib/utils');

const currentUrl = config.currentHost;
const transporter = nodemailer.createTransport({
    host: 'smtp.mail.ru',
    port: 587,
    secure: false,
    auth: {
        user: config.smtpLogin,
        pass: config.smtpPass,
    },
});

const privilegies = new Map([
    ['User', 0], // By default
    ['Active User', 1], // Score 50-100
    ['Proffesional', 2], // Score 100-500
    ['Main Proffesional', 3], // Can gets only with active. Moderators can't set theese(0-3) privilegies. Score 500+
    ['Moderator', 4],
    ['Active Moderator', 5],
    ['Main Moderator', 6],
    ['Developer', 7],
    ['Main Developer', 8],
    ['First Developer', 9],
]);

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

async function sendVerification(currentUser, code) {
    const emailContent = `Hello, dear ${currentUser.username}! Verificate your profile at Unimaster Blog:
                          \n${currentUrl}/api/user/verificate?code=${code}
                          \nThis verification need to disable some constraints of your blog profile. 
                          \nList of constraints:
                          \n-You can't write comments
                          \n-You can't give grades(likes and dislikes)
                          \n-You cant't write own posts
                          \n-You can't change username
                          \n-And more... `;
    await transporter.sendMail({
        from: config.blogMail,
        to: currentUser.email,
        subject: 'Verificate your Unimaster blog profile!',
        text: emailContent,
    });
}

async function checkOldCode(currentUser, res) {
    const response = Object.create(objects.serverResponse);
    const existedCode = await VerificationUser.findOne({ user: currentUser._id });

    if (existedCode) {
        const passed = (new Date().getTime() - existedCode.creationDate.getTime()) / 1000;
        if (passed < 600) {
            response.success = false;
            response.msg = 'You can send only one verification per 10 minutes';
            response.content = {
                secondsLeft: 600 - passed,
                timeout: existedCode.creationDate,
            };

            res.status(403).json(response);
            return false;
        }

        await VerificationUser.findByIdAndDelete(existedCode._id);
    }

    return true;
}

async function generateNewCode(currentUser) {
    const verificationCode = crypto.randomBytes(32).toString('hex');
    new VerificationUser({ user: currentUser._id, verificationCode }).save();

    await sendVerification(currentUser, verificationCode);
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

    async changeLocation(req, res) {
        const response = Object.create(objects.serverResponse);

        try {
            if (validations.validateInput(req, res)) return;

            const { newLocation, currentUser } = req.body;

            if (!currentUser) {
                response.success = false;
                response.msg = 'User credentials not correct';

                res.status(401).json(response);
                return;
            }

            await User.findByIdAndUpdate(currentUser._id, {
                $set: {
                    location: newLocation,
                },
            });

            response.success = true;
            response.msg = 'User location has been changed successful';

            res.json(response);
        }
        catch (err) {
            unknownError(res, err);
        }
    },

    async setPrivilege(req, res) {
        const response = Object.create(objects.serverResponse);

        try {
            if (validations.validateInput(req, res)) return;

            const { currentUser, newPrivilege, usernameToSet } = req.body;
            const userToSet = await User.findOne({ username: usernameToSet });

            if (!userToSet) {
                response.success = false;
                response.msg = 'Incorrect username for search';

                res.status(400).json(response);
                return;
            }

            const numericPrivilegeToSet = privilegies.get(newPrivilege);
            const currentNumericPrivilege = privilegies.get(userToSet.privilege);
            const currentUserNimericPrivilege = privilegies.get(currentUser.privilege);

            if (!numericPrivilegeToSet) {
                response.success = false;
                response.msg = 'Incorrect privilege to set';

                res.status(400).json(response);
                return;
            }

            if (currentNumericPrivilege >= currentUserNimericPrivilege
                || numericPrivilegeToSet <= 3) {
                response.success = false;
                response.msg = 'Access denied';

                res.status(403).json(response);
                return;
            }

            await User.findByIdAndUpdate(userToSet._id, {
                $set: {
                    privilege: newPrivilege,
                },
            });

            response.success = true;
            response.msg = `User's ${usernameToSet} privilege has been changed successful`;

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

    async sendVerificationAgain(req, res) {
        const response = Object.create(objects.serverResponse);

        try {
            const { currentUser } = req.body;

            if (!currentUser) {
                response.success = false;
                response.msg = 'User credantials not correct';

                res.status(401).json(response);
                return;
            }

            // Verificated user not need for verification. It's not an error
            if (currentUser.verified === true) {
                response.success = true;
                response.msg = 'User already verificated';

                res.status(208).json(response);
                return;
            }

            if (await checkOldCode(currentUser, res)) {
                await generateNewCode(currentUser);

                response.success = true;
                response.msg = 'Verification code has been sended again';

                res.json(response);
            }
        }
        catch (err) {
            unknownError(res, err);
        }
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
