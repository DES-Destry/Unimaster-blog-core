const { Schema, model } = require('mongoose');
const bcrypt = require('bcrypt');
const config = require('../lib/config');

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

uSchema.virtual('password').set(async function(value) {
    try{
        const salt = await bcrypt.genSalt(config.saltValue);
        const hash = await bcrypt.hash(value, salt);

        this.hPassword = hash;
    }
    catch(err){
        console.log(`VIRTUAL SET PASSWORD ERROR: ${err.message}`);
    }
});

uSchema.methods.checkPass = async function(pass) {
    try{
        const result = await bcrypt.compare(pass, this.hPassword);
        return result;
    }
    catch(err){
        console.log(`CHECK PASS ERROR: ${err.message}`);
        return false;
    }
}

module.exports = model('User', uSchema);