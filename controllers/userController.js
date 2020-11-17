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
            console.log(newDescription);
            const currentUser = req.session.passport.user;

            if (currentUser){
                await User.findOneAndUpdate({ _id: currentUser._id }, { $set: { profileDescription: newDescription } });
                return res.send('Description updated');
            }

            res.status(401).send('Current user not found!');
        }
        catch(err){
            res.status(500).send('Unknown server error');
        }
    },

    changeUsername: function(req, res){
        res.send('test');
    }
}