const User = require('../models/User');
const { validationResult } = require('express-validator');
const passport = require('passport');
const jwt = require('jsonwebtoken');

const config = require('../lib/config');

module.exports = {
    auth: function(req, res, next){
        //Authentication with passport-jwt
        passport.authenticate('jwt', (err, user) => {
            if (err) return res.status(500).send('Unknown authenticate error!');

            if (user){
                next();
            }
            else{
                res.status(401).send('Users data is not correct. Try again or register the user.');
            }
        })(req, res, next);
    },

    registration: async function(req, res){
        try{
            //Validate user input
            var errors = validationResult(req);
            if (!errors.isEmpty()) return res.status(400).send(errors.array());

            const { username, email, password } = req.body;

            //If such user already exist we can't create new user
            const user = await User.findOne({ email });
            if (user) return res.status(403).send('User with this email already exists!');

            //Create new user
            const createdUser = new User({ username, email, password });

            //Generate token and save user
            const token = jwt.sign({ email, username }, config.jwtSecret);
            createdUser.save();

            //Form a JSON for send to the client. It contains jwt and user data without password
            const response = { ...createdUser, ...{ token } };
            delete response.hPassword

            res.json(response);
        }
        catch(err){
            res.status(500).send('Unknown server error!');
        }
    },

    login: async function(req, res){
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
                        if (err) return res.status(500).send('Unknown authenticate error!');

                        //Generate token for sending
                        const email = findedUser.email;
                        const username = findedUser.username;
                        const token = jwt.sign({ email, username }, config.jwtSecret);

                        //Form a JSON for send to the client. It contains jwt and user data without password
                        const response = { ...findedUser._doc, ...{ token } };
                        delete response.hPassword;

                        return res.send(response);
                    });
                }

                return res.status(401).send('Wrong password!');
            }

            res.status(401).send('Wrong login!');
        }
        catch(err){
            console.log(err);
            res.status(500).send('Unknown server error!');
        }
    },

    logout: function(req, res){
        req.logout();
        delete req.session.passport.user;
        res.send('Loging out has been successeful!');
    }
}