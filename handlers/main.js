const basePostHandlers = require('./basePostHandlers');
const passportHandler = require('./passportHandler');
const sessionHandler = require('./sessionHandler');

module.exports = [
    basePostHandlers,
    passportHandler,
    sessionHandler
] 