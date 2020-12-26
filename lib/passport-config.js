const { Strategy, ExtractJwt } = require('passport-jwt');
const User = require('../models/User');
const config = require('./config');

const opts = {
    secretOrKey: config.jwtSecret,
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
};

async function jwtVerify(payload, done) {
    try {
        const { username, email } = payload;

        const findedUser = await User.findOne({ username, email });

        if (findedUser) {
            done(null, findedUser);
        }
        else {
            done(null, false);
        }
    }
    catch (err) {
        done(err);
    }
}

module.exports = (passport) => passport.use(new Strategy(opts, jwtVerify));
