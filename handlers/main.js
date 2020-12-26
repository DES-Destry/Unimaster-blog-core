const basePostHandlers = require('./basePostHandlers');
const passportHandler = require('./passportHandler');
const corsHandler = require('./corsHandler');

module.exports = [
    basePostHandlers,
    passportHandler,
    corsHandler
];
