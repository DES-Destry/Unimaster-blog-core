const { Schema, Types, model } = require('mongoose');

const rSchema = new Schema({
    userToRestore: {
        type: Types.ObjectId,
        ref: 'User',
        required: true,
    },
    restoreCode: {
        type: String,
        required: true,
    },
    creationDate: {
        type: Date,
        default: Date.now(),
    },
});

module.exports = model('RestoreUser', rSchema);
