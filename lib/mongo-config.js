const mongoose = require('mongoose');
const config = require('./config');

module.exports = (callback) => {
    mongoose.connect(config.localDb)
    .then(() => callback())
    .catch((err) => callback(err));
};
