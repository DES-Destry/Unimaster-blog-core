const passport = require('passport');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');

const User = require('../models/User');
const config = require('../lib/config');
const { objects } = require('../lib/utils');

function validateErrors(req, res){
    const response = Object.create(objects.serverResponse);

    var errors = validationResult(req);
    if (!errors.isEmpty()) {
        response.errorMsg = 'Validation error';
        response.errorType = typeof(Error);
        response.content = errors.array();

        res.status(400).json(response);
        return true;
    }
}

module.exports = {
    auth: function(req, res, next){
        const response = Object.create(objects.serverResponse);

        //Authentication with passport-jwt
        passport.authenticate('jwt', (err, user) => {
            if (err) {
                response.errorMsg = 'Unknown authenticate error'
                response.errorType = typeof(Error);

                return res.status(500).json(response);
            }

            if (user){
                return next();
            }

            response.errorMsg = 'Users data is not correct'
            response.errorType = typeof(Error);
            res.status(401).json(response);

        })(req, res, next);
    },

    registration: async function(req, res){
        const response = Object.create(objects.serverResponse);

        try{
            //Validate user input
            if(validateErrors(req, res)) return;

            const { username, email, password } = req.body;

            //If such user already exist we can't create new user
            const userByEmail = await User.findOne({ email });
            const userByUsername = await User.findOne({ username });

            if (userByEmail || userByUsername){
                response.errorMsg = 'User with this email already exists';
                response.errorType = typeof(Error);

                return res.status(403).json(response);
            }

            //Create new user
            const createdUser = new User({ username, email, password });

            //Generate token and save user
            const token = jwt.sign({ email, username }, config.jwtSecret);
            createdUser.save();

            //Form a JSON for send to the client. It contains jwt and user data without password
            response.msg = 'User has been created'
            response.content = { ...createdUser._doc, ...{ token } };
            delete response.content.hPassword;

            res.json(response);
        }
        catch(err){
            response.errorMsg = err.message;
            response.errorType = typeof(err);
            response.content = err;

            res.status(500).json(response);
        }
    },

    login: async function(req, res){
        const response = Object.create(objects.serverResponse);

        try{
            const { login, password } = req.body;

            //Users login can contain username or email
            const findedUserByEmail = await User.findOne({ email: login });
            const findedUserByUsername = await User.findOne({ username: login });

            //These two variables cannot be populated at the same time. One of them is necessarily undefined.
            if (findedUserByEmail || findedUserByUsername){
                const findedUser = findedUserByEmail ? findedUserByEmail : findedUserByUsername;

                if (findedUser.checkPass(password)){
                    return req.logIn(findedUser, err => {
                        if (err) {
                            response.errorType = typeof(err);
                            response.errorMsg = err.message;

                            return res.status(500).json(errRescponse);
                        }

                        //Generate token for sending
                        const email = findedUser.email;
                        const username = findedUser.username;
                        const token = jwt.sign({ email, username }, config.jwtSecret);

                        //Form a JSON for send to the client. It contains jwt and user data without password
                        response.msg = 'Loging in has been successful';
                        response.content = {
                            ...findedUser._doc, 
                            ...{ token }
                        };
                        delete response.content.hPassword;

                        return res.json(response);
                    });
                }

                response.errorMsg = 'Incorrect password'
                response.errorType = typeof(Error);
                return res.status(401).json(response);
            }

            response.errorMsg = 'User with this login not exists'
            response.errorType = typeof(Error);
            res.status(401).json(response);
        }
        catch(err){
            response.errorType = typeof(err);
            response.errorMsg = err.message;
            response.content = err;

            res.status(500).json(response);
        }
    },

    logout: function(req, res){
        const response = Object.create(objects.serverResponse);

        req.logout();
        if (req.session.passport.user) delete req.session.passport.user;

        response.msg = 'Loging out has been successeful'
        res.json(response);
    }
}