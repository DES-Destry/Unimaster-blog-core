const { Schema, model, Types } = require('mongoose');
const { genSaltSync, hashSync, compareSync } = require('bcrypt');
const jwt = require('jsonwebtoken');

const config = require('../lib/config');
const logger = require('../dev/logger');

const uSchema = new Schema({
    username: {
        type: String,
        required: true,
        unique: true,
    },
    alias: {
        type: String,
        required: false,
        default: '',
    },
    // TODO: multiple emails
    email: {
        type: String,
        required: true,
        unique: true,
    },
    hPassword: {
        type: String,
        required: true,
    },
    avatar: {
        type: Types.ObjectId,
        required: false,
    },
    profileDescription: {
        type: String,
        required: false,
        default: 'Hey. You can write information about yourself here!',
    },
    score: {
        type: Number,
        default: 0,
    },
    privilege: {
        type: String,
        enum: ['First Developer', 'Main Developer', 'Developer', 'Main Moderator', 'Active Moderator', 'Moderator', 'Main Proffesional', 'Proffesional', 'Active User', 'User'],
        default: 'User',
    },
    location: {
        type: String,
        required: false,
    },
    createDate: {
        type: Date,
        default: Date.now(),
    },
    lastPasswordChanged: {
        type: Date,
        default: Date.now(),
    },
    links: [
        {
            site: {
                type: String,
                require: true,
            },
            link: {
                type: String,
                require: true,
            },
        },
    ],
    verified: {
        type: Boolean,
        default: false,
    },
});

uSchema.virtual('password').get(function () {
    return this.hPassword;
})
.set(function (value) {
    try {
        const salt = genSaltSync(Number(config.saltValue));
        const hash = hashSync(value, salt);

        this.hPassword = hash;
    }
    catch (err) {
        logger.logError(`VIRTUAL SET PASSWORD ERROR: ${err.message}`);
    }
});

uSchema.methods.checkPass = function (pass) {
    try {
        return compareSync(pass, this.hPassword);
    }
    catch (err) {
        logger.logError(`CHECK PASS ERROR: ${err.message}`);
        return false;
    }
};

uSchema.methods.genToken = function () {
    const { email, username, lastPasswordChanged } = this;
    return jwt.sign({ email, username, lastPasswordChanged }, config.jwtSecret);
};

module.exports = model('User', uSchema);
