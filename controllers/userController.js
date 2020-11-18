const User = require('../models/User');
const { validationResult } = require('express-validator');

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

            if (currentUser){
                if (currentUser.username === newUsername){
                    return res.status(400).send('The old and new username must be different');
                }

                const someUser = await User.findOne({ username: newUsername });
                if (someUser){
                    return res.status(400).send('The user with this username already exists');
                }

                await User.findByIdAndUpdate(currentUser._id, { $set: { username: newUsername } });
                return res.send('Users username has been changed');
            }

            res.status(401).send('Current user not found!');
        }
        catch(err){
            res.status(500).send('Unknown server error');
        }
    }
}