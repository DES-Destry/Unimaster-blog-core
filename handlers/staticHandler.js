const express = require('express');
const config = require('../lib/config');

module.exports = (app) => {
    app.use('/avatars', express.static(config.avatarPath));
};
