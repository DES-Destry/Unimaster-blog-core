const passport = require('passport');
const passportConfig = require('../lib/passport-config');

module.exports = (app) => {
    app.use(passport.initialize());
    passportConfig(passport);
}