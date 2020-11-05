const User = require('../models/User');
const { validationResult } = require('express-validator');

module.exports = {
    registration: async function(req, res){
        var errors = validationResult(req);
        if (!errors.isEmpty()) return res.status(400).send(errors.array());

        const { username, email, password } = req.body;

        const user = await User.findOne({ email });
        if (user) return res.status(400).send('User with this email already exists!');

        new User({ username, email, password }).save();
        res.send('User added successful!');
    }
}