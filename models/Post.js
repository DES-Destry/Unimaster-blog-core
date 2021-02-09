const { Schema, model, Types } = require('mongoose');

const pSchema = new Schema({
    title: {
        type: String,
        required: true,
        maxlength: 20,
    },
    description: {
        type: String,
        required: false,
        maxlength: 70,
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
                require: false,
            },
        },
    ],
});

module.exports = model('Post', pSchema);
