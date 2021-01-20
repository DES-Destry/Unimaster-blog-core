const crypto = require('crypto');
const nodemailer = require('nodemailer');
const { join, dirname } = require('path');
const { genSaltSync, hashSync } = require('bcrypt');

const User = require('../models/User');
const VerificationUser = require('../models/VerificationUser');
const RestoreUser = require('../models/RestoreUser');
const UsernameChangeList = require('../models/UsernameChangeList');
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
    let diffDays = 31; // 31 - for pass (diffDays < 30) if username never changing

    // The old and new username must be different
    if (currentUser.username === newUsername) {
        response.success = false;
        response.msg = 'The old and new username must be different';

        res.status(418).json(response);
        return true;
    }

    // Check user with current new username.
    // If user with this username already exists, return HTTP code 403
    const someUser = await User.findOne({ username: newUsername });

    // Check last username changing
    const changeList = await UsernameChangeList.find({ user: currentUser._id })
    .sort({ changingDate: -1 });

    if (changeList[0]) {
        const lastChangeDate = changeList[0].changingDate;
        const oneDay = 86400000; // hours*minutes*seconds*milliseconds

        diffDays = Math.round(Math.abs((lastChangeDate.getTime() - new Date().getTime()) / oneDay));
    }

    // If user with this username already exists
    // Or this user change username 30 days ago or later
    if (someUser || diffDays < 30) {
        response.success = false;
        response.msg = 'The user with this username already exists';
        response.content = { left: 30 - diffDays };

        res.status(403).json(response);
        return true;
    }

    return false;
}

async function deleteUserErrorsHandled(findedUser, currentUser, password, res) {
    const response = Object.create(objects.serverResponse);

    if ((!findedUser || !currentUser._id.equals(findedUser._id)) && currentUser.privilege !== 'First Developer') {
        response.success = false;
        response.msg = 'Access denied';

        res.status(403).json(response);
        return true;
    }

    if ((!findedUser || !findedUser.checkPass(password)) && currentUser.privilege !== 'First Developer') {
        response.success = false;
        response.msg = 'Users credentials not correct';

        res.status(401).json(response);
        return true;
    }

    return false;
}

async function sendMail(to, subject, text) {
    await transporter.sendMail({
        from: config.blogMail,
        to,
        subject,
        text,
    });
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

    await sendMail(currentUser.email, 'Verificate your Unimaster blog profile!', emailContent);
}

async function sendPasswordChangedAlert(currentUser) {
    const emailContent = `Hello, dear ${currentUser.username}!
                          \nYour profile password has been changed!
                          \nIf it was not you then please restore your password:
                          \nLINK(coming soon...)`;

    await sendMail(currentUser.email, 'Your Unimaster blog profile password has been changed!', emailContent);
}

async function sendPasswordRestoreCode(user, code) {
    const emailContent = `Hello, dear ${user.username}!
                        \nYour password restore code:
                        \n${code}`;

    await sendMail(user.email, 'Your Unimaster blog profile password restoring code!', emailContent);
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

async function changePasswordAndGetToken(user, password) {
    const salt = genSaltSync(Number(config.saltValue));
    const hPassword = hashSync(password, salt);

    await User.findByIdAndUpdate(user._id, {
        $set: {
            hPassword,
            lastPasswordChanged: Date.now(),
        },
    });
    await sendPasswordChangedAlert(user);

    return (await User.findById(user._id)).genToken();
}

async function checkPasswordCode(login, code, res) {
    const response = Object.create(objects.serverResponse);
    const restoreRequired = await RestoreUser.findOne({ restoreCode: code }).populate('userToRestore');

    if (!restoreRequired
        || (restoreRequired.userToRestore.username !== login
            && restoreRequired.userToRestore.email !== login)) {
        response.success = false;
        response.msg = 'Code not avaiable for this user';

        res.status(403).json(response);
        return false;
    }

    return true;
}

module.exports = {
    async changeDescription(req, res) {
        const response = Object.create(objects.serverResponse);

        try {
            if (validations.validateInput(req, res)) return;

            const { newDescription, currentUser } = req.body;

            await User.findByIdAndUpdate(currentUser._id, {
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

            new UsernameChangeList({
                user: currentUser._id,
                newUsername,
                oldUsername: currentUser.username,
            }).save();

            await User.findByIdAndUpdate(currentUser._id, { $set: { username: newUsername } });
            const changedUser = await User.findById(currentUser._id);

            const token = changedUser.genToken();

            response.success = true;
            response.msg = 'Users username has been changed successful';
            response.content = { token };

            res.json(response);
        }
        catch (err) {
            unknownError(res, err);
        }
    },

    async changeAlias(req, res) {
        const response = Object.create(objects.serverResponse);

        try {
            if (validations.validateInput(req, res)) return;

            const { newAlias, currentUser } = req.body;

            if (newAlias === currentUser.alias) {
                response.success = false;
                response.msg = 'Current alias and old alias are same';

                res.status(418).json(response);
                return;
            }

            await User.findByIdAndUpdate(currentUser._id, {
                $set: {
                    alias: newAlias,
                },
            });

            response.success = true;
            response.msg = 'Users alias has been changed successful';

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

    async rewriteLinks(req, res) {
        const response = Object.create(objects.serverResponse);

        try {
            if (validations.validateInput(req, res)) return;

            const { currentUser, links } = req.body;
            await User.findByIdAndUpdate(currentUser._id, { $set: { links } });

            response.success = true;
            response.msg = 'User\'s links rewrited successful';

            res.json(response);
        }
        catch (err) {
            unknownError(res, err);
        }
    },

    async changePassword(req, res) {
        const response = Object.create(objects.serverResponse);

        try {
            if (validations.validateInput(req, res)) return;

            const { currentUser, oldPassword, newPassword } = req.body;

            if (!currentUser.checkPass(oldPassword)
            || !currentUser.verified
            || oldPassword === newPassword) {
                response.success = false;
                response.msg = 'Access denied';

                res.status(403).json(response);
                return;
            }

            const token = await changePasswordAndGetToken(currentUser, newPassword);

            response.success = true;
            response.msg = 'Password has been changed';
            response.content = { token };

            res.json(response);
        }
        catch (err) {
            unknownError(res, err);
        }
    },

    async restorePasswordRequest(req, res) {
        const response = Object.create(objects.serverResponse);

        try {
            if (validations.validateInput(req, res)) return;

            const { login } = req.body;

            const userToRestore = await findUserByLogin(login);

            if (!userToRestore) {
                response.success = false;
                response.msg = 'User with this login not found';

                res.status(400).json(response);
                return;
            }

            await RestoreUser.findOneAndDelete({ userToRestore: userToRestore._id });

            const restoreCode = crypto.randomInt(100000, 999999);
            new RestoreUser({ userToRestore: userToRestore._id, restoreCode }).save();

            await sendPasswordRestoreCode(userToRestore, restoreCode);

            response.success = true;
            response.msg = 'Restore code has been sended. Check email';

            res.json(response);
        }
        catch (err) {
            unknownError(res, err);
        }
    },

    async checkRestoreCode(req, res) {
        const response = Object.create(objects.serverResponse);

        try {
            if (validations.validateInput(req, res)) return;

            const { login, code } = req.body;

            if (!(await checkPasswordCode(login, code, res))) return;

            response.success = true;
            response.msg = 'Code avaiable for this user';

            res.json(response);
        }
        catch (err) {
            unknownError(res, err);
        }
    },

    async restorePassword(req, res) {
        const response = Object.create(objects.serverResponse);

        try {
            if (validations.validateInput(req, res)) return;

            const { login, code, newPassword } = req.body;

            if (!(await checkPasswordCode(login, code, res))) return;

            const userToRestore = await findUserByLogin(login);
            const token = await changePasswordAndGetToken(userToRestore, newPassword);

            await RestoreUser.findOneAndDelete({ userToRestore: userToRestore._id });

            response.success = true;
            response.msg = 'Password has been changed';
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

    async sendVerificationAgain(req, res) {
        const response = Object.create(objects.serverResponse);

        try {
            const { currentUser } = req.body;

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
