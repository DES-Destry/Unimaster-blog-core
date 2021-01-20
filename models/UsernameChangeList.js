const { model, Schema, Types } = require('mongoose');

const uSchema = new Schema({
    user: {
        type: Types.ObjectId,
        ref: 'User',
        required: true,
    },
    oldUsername: {
        type: String,
        required: true,
    },
    newUsername: {
        type: String,
        required: true,
    },
    changingDate: {
        type: Date,
        default: Date.now(),
    },
});

module.exports = model('UsernameChangeList', uSchema);
