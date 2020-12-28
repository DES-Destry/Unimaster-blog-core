const { Schema, Types, model } = require('mongoose');

const vSchema = new Schema({
    user: {
        type: Types.ObjectId,
        ref: 'User',
        required: true,
    },
    verificationCode: {
        type: String,
        required: true,
    },
});

module.exports = model('VerificationUser', vSchema);
