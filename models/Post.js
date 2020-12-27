const { Schema, model, Types } = require('mongoose');

const pSchema = new Schema({
    description: {
        type: String,
        required: true,
    },
    content: {
        type: String,
        required: true,
        minlength: 25,
    },
    tags: [String],
    writer: {
        type: Types.ObjectId,
        ref: 'User',
        required: true,
    },
    createDate: {
        type: Date,
        default: Date.now(),
    },
    likes: [
        {
            type: Types.ObjectId,
            ref: 'User',
        },
    ],
    dislikes: [
        {
            type: Types.ObjectId,
            ref: 'User',
        },
    ],
    comments: [
        {
            user: {
                type: Types.ObjectId,
                ref: 'User',
                required: true,
            },
            content: {
                type: String,
                required: true,
            },
            creationDate: {
                type: Date,
                default: Date.now(),
            },
            likes: [
                {
                    type: Types.ObjectId,
                    ref: 'User',
                },
            ],
            dislikes: [
                {
                    type: Types.ObjectId,
                    ref: 'User',
                },
            ],
            answerTo: {
                type: Types.ObjectId,
            },
        },
    ],
});

module.exports = model('Post', pSchema);
