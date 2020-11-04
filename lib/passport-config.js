const {Strategy, ExtractJwt} = require('passport-jwt');
const User = require('../models/User');
const config = require('./config');

const opts = {
    secretOrKey: config.jwtSecret,
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken
}

async function jwtVerify(payload, done){
    try{
        const {_id, username, email, hPassword} = payload;
        const findedUser = User.findOne({_id, username, email, hPassword});

        if (findedUser){
            done(null, findedUser);
        }
        else{
            done(null, false);
        }
    }
    catch(err){
        done(err);
    }
}

module.exports = (passport) => {
    passport.use(new Strategy(opts, jwtVerify));

    passport.serializeUser((payload, done) => done(null, payload._id));
    passport.deserializeUser((_id, done) => {
        User.findOne({_id}, (err, result) => {
            if (err) return done(err);

            done(null, result);
        });
    });
}