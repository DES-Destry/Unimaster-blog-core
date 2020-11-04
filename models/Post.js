const {Schema, model} = require('mongoose');

const pSchema = new Schema({
    description:{
        type: String,
        required: true
    },
    content: {
        type: String,
        required: true,
        minlength: 25
    },
    createDate: {
        type: Date,
        default: Date.now
    },
    likes:[
        {
            user: {
                type: Schema.Types.ObjectId,
                ref: 'users',
                required: true
            }
        }
    ],
    dislikes:[
        {
            user: {
                type: Schema.Types.ObjectId,
                ref: 'users',
                required: true
            }
        }
    ],
    comments:[
        {
            user: {
                type: Schema.Types.ObjectId,
                ref: 'users',
                required: true
            },
            content:{
                type: String,
                required: true
            },
            creationDate:{
                type: Date,
                required: true
            },
            likes:[
                {
                    user: {
                        type: Schema.Types.ObjectId,
                        ref: 'users',
                        required: true
                    }
                }
            ],
            dislikes:[
                {
                    user: {
                        type: Schema.Types.ObjectId,
                        ref: 'users',
                        required: true
                    }
                }
            ],
            answerTo: {
                type: String
            }
        }
    ]
});

module.exports = model('Post', pSchema);