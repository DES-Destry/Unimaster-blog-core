const passport = require('passport');
const crypto = require('crypto');
const nodemailer = require('nodemailer');

const User = require('../models/User');
const VerificationUser = require('../models/VerificationUser');
const config = require('../lib/config');
const logger = require('../dev/logger');
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

async function findUserByLogin(login) {
    // Users login can contain username or email
    const foundUserByEmail = await User.findOne({ email: login });
    const foundUserByUsername = await User.findOne({ username: login });

    // These two variables cannot be populated at the same time.
    // One of them is necessarily undefined.
    return foundUserByEmail ? foundUserByEmail : foundUserByUsername;
}

async function sendVerification(username, email, code) {
    const emailContent = `Hello, dear ${username}! Verificate your profile at Unimaster Blog:
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
        to: email,
        subject: 'Verificate your Unimaster blog profile!',
        text: emailContent,
    });
}

async function createUserAndGetTokenWithEmailStatus(username, email, password) {
    const result = {
        token: '',
        emailSended: true,
    };
    // Create new user
    const createdUser = new User({ username, email, password });
    const id = createdUser._id;
    const verificationCode = crypto.randomBytes(32).toString('hex');
    const verificationUser = new VerificationUser({ user: id, verificationCode });

    // Save user and return token
    createdUser.save();
    verificationUser.save();

    try {
        await sendVerification(username, email, verificationCode);
    }
    catch (err) {
        result.emailSended = false;
        logger.logError(err);
    }

    result.token = createdUser.genToken();
    return result;
}

module.exports = {
    auth(req, res, next) {
        const response = Object.create(objects.serverResponse);

        // Authentication with passport-jwt
        passport.authenticate('jwt', { session: false }, (err, user) => {
            if (err) {
                unknownError(res, err);
            }

            if (user) {
                req.body.currentUser = user;
                req.user = user;
                next();
                return;
            }

            response.success = false;
            response.msg = 'Users data is not correct';

            res.status(401).json(response);
        })(req, res, next);
    },

    async registration(req, res) {
        const response = Object.create(objects.serverResponse);

        try {
            if (validations.validateInput(req, res)) return;

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

            const {
                token,
                emailSended,
            } = await createUserAndGetTokenWithEmailStatus(username, email, password);

            // Form a JSON for send to the client. It contains jwt and user data without password
            response.success = true;
            response.msg = 'User has been created';
            response.content = { token, username };

            const statusCode = emailSended ? 200 : 201;
            if (!emailSended) {
                response.msg += ', but email not sended';
            }

            res.status(statusCode).json(response);
        }
        catch (err) {
            unknownError(res, err);
        }
    },

    async login(req, res) {
        const response = Object.create(objects.serverResponse);

        try {
            const { login, password } = req.body;

            const foundUser = await findUserByLogin(login);

            if (!foundUser || !foundUser.checkPass(password)) {
                response.success = false;
                response.msg = 'Incorrect user credentials';

                res.status(401).json(response);
                return;
            }

            // Generate token and username for sending
            const token = foundUser.genToken();
            const { username, verified } = foundUser;

            // Form a JSON for send to the client.
            // It contains jwt and user data without password
            response.success = true;
            response.msg = 'Loging in has been successful';
            response.content = { token, username, verified };

            res.json(response);
        }
        catch (err) {
            unknownError(res, err);
        }
    },

    async checkAuth(req, res) {
        const response = Object.create(objects.serverResponse);

        try {
            const { currentUser } = req.body;

            if (!currentUser) {
                response.success = false;
                response.msg = 'Authentication error';

                res.status(401).json(response);
                return;
            }

            response.success = true;
            response.msg = 'Successful authorization';

            res.json(response);
        }
        catch (err) {
            unknownError(res, err);
        }
    },
};
