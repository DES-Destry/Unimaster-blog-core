const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');

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
    changeDescription: async function(req, res){
        const response = Object.create(objects.serverResponse);

        try{
            if (validateErrors(req, res)) return;

            const { newDescription } = req.body;
            const currentUser = req.session.passport.user;

            //If user exists in session
            if (currentUser){
                await User.findByIdAndUpdate(currentUser._id, { $set: { profileDescription: newDescription } });

                response.msg = 'Description updated';
                response.content = { newDescription };

                return res.json(response);
            }

            response.errorMsg = 'Current user not found';
            response.errorType = typeof(Error);

            res.status(401).json(response);
        }
        catch(err){
            response.errorMsg = err.message;
            response.errorType = typeof(err);
            response.content = err;

            res.status(500).json(response);
        }
    },

    changeUsername: async function(req, res){
        const response = Object.create(objects.serverResponse);

        try{
            if (validateErrors(req, res)) return;

            const { newUsername } = req.body;
            const currentUser = req.session.passport.user;

            //If user exists in session
            if (currentUser){
                //The old and new username must be different
                if (currentUser.username === newUsername){
                    response.errorMsg = 'The old and new username must be different';
                    response.errorType = typeof(Error);

                    return res.status(400).json(response);
                }

                //Check user with current new username. If user with this username already exists, return HTTP code 400
                const someUser = await User.findOne({ username: newUsername });
                if (someUser){
                    response.errorMsg = 'The user with this username already exists';
                    response.errorType = typeof(Error);

                    return res.status(400).json(response);
                }

                await User.findByIdAndUpdate(currentUser._id, { $set: { username: newUsername } });
                const newUser = await User.findById(currentUser._id);

                req.logout();

                return req.logIn(newUser, err => {
                    if (err){
                        response.errorMsg = err.message;
                        response.errorType = typeof(err);
                        response.content = err;

                        return res.status(500).json(response);
                    }

                    const email = newUser.email;
                    const username = newUser.username;
                    const token = jwt.sign({ email, username }, config.jwtSecret);

                    response.msg = 'Users username has been changed successful';
                    response.content = { ...newUser._doc, ...{ token } };
                    delete response.content.hPassword;
                    
                    return res.json(response);
                });
            }

            response.errorMsg = 'Current user not found';
            response.errorType = typeof(Error);

            res.status(401).json(response);
        }
        catch(err){
            response.errorMsg = err.message;
            response.errorType = typeof(err);
            response.content = err;

            res.status(500).json(response);
        }
    },

    deleteUser: async function(req, res){
        const response = Object.create(objects.serverResponse);

        try{
            if (validateErrors(req, res)) return;

            const { login, password } = req.body;

            //Users login can contain username or email
            const findedUserByEmail = await User.findOne({ email: login });
            const findedUserByUsername = await User.findOne({ username: login });

            //These two variables cannot be populated at the same time. One of them is necessarily undefined.
            if (findedUserByEmail || findedUserByUsername){
                const findedUser = findedUserByEmail ? findedUserByEmail : findedUserByUsername;

                if (findedUser.checkPass(password)){
                    //Delete from user database and logout from session
                    await User.findByIdAndDelete(findedUser._id);
                    req.logout();

                    response.msg = 'User has been deleted';
                    response.content = { deleted: findedUser };

                    return res.json(response);
                }

                response.errorMsg = 'Incorrect password';
                response.errorType = typeof(Error);

                return res.status(401).json(response);
            }

            response.errorMsg = 'User with this email or username not exists';
            response.errorType = typeof(Error);

            res.status(401).json(response);
        }
        catch(err){
            response.errorMsg = err.message;
            response.errorType = typeof(err);
            response.content = err;

            res.status(500).json(response);
        }
    }
}