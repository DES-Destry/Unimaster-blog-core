const session = require('express-session');
const MongoStore = require('connect-mongo')(session);

const config = require('../lib/config');

module.exports = (app) => {
    app.use(session({
        secret: config.sessionSecret,
        store: new MongoStore({
            url: config.localDb,
            db: 'sessions'
        }),
        saveUninitialized: false,
        resave: false
    }));
}