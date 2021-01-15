const mongoose = require('mongoose');
const config = require('./config');

module.exports = (mode, callback) => {
    let connectionString = '';
    if (mode === 'prod') {
        connectionString = config.dbUri;
    }
    else {
        connectionString = config.localDb;
    }

    mongoose.connect(connectionString, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useFindAndModify: false,
        useCreateIndex: true,
    })
    .then(() => callback())
    .catch((err) => callback(err));
};
