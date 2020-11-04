const {Schema, model} = require('mongoose');

const uSchema = new Schema({
    username: {
        type: String,
        required: true,
        unique: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    hPassword: {
        type: String,
        required: true
    },
    profileDescription: {
        type: String,
        required: false,
        default: 'Hey. You can write information about yourself here!'
    },
    createDate: {
        type: Date,
        default: Date.now
    }
});

module.exports = model('User', uSchema);