const mongoose = require('mongoose');
const config = require('./config');

module.exports = (callback) => {
    mongoose.connect(config.localDb, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useFindAndModify: false,
    })
    .then(() => callback())
    .catch((err) => callback(err));
};
