const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const config = require('../lib/config');

function validateErrors(req, res){
    var errors = validationResult(req);
    if (!errors.isEmpty()) {
        res.status(400).send(errors.array());
        return true;
    }
}

module.exports = {
    changeDescription: async function(req, res){
        try{
            if (validateErrors(req, res)) return;

            const { newDescription } = req.body;
            const currentUser = req.session.passport.user;

            //If user exists in session
            if (currentUser){
                await User.findByIdAndUpdate(currentUser._id, { $set: { profileDescription: newDescription } });
                return res.send('Description updated');
            }

            res.status(401).send('Current user not found!');
        }
        catch(err){
            res.status(500).send('Unknown server error');
        }
    },

    changeUsername: async function(req, res){
        try{
            if (validateErrors(req, res)) return;

            const { newUsername } = req.body;
            const currentUser = req.session.passport.user;

            //If user exists in session
            if (currentUser){
                //The old and new username must be different
                if (currentUser.username === newUsername){
                    return res.status(400).send('The old and new username must be different');
                }

                //Check user with current new username. If user with this username already exists, return HTTP code 400
                const someUser = await User.findOne({ username: newUsername });
                if (someUser){
                    return res.status(400).send('The user with this username already exists');
                }

                await User.findByIdAndUpdate(currentUser._id, { $set: { username: newUsername } });
                const newUser = await User.findById(currentUser._id);

                req.logout();

                return req.logIn(newUser, err => {
                    if (err) return res.status(500).send('Unknown server error');

                    const email = newUser.email;
                    const username = newUser.username;
                    const token = jwt.sign({ email, username }, config.jwtSecret);

                    const response = { ...newUser._doc, ...{ token } }
                    delete response.hPassword;
                    
                    return res.json(response);
                });
            }

            res.status(401).send('Current user not found!');
        }
        catch(err){
            res.status(500).send('Unknown server error');
        }
    },

    deleteUser: async function(req, res){
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
                    return res.send('User has been deleted');
                }

                return res.status(401).send('Incorrect password');
            }

            res.status(401).send('User with this email or username not exists');
        }
        catch(err){
            res.status(500).send('Unknown server error');
        }
    }
}