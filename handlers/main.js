const basePostHandlers = require('./basePostHandlers');
const passportHandler = require('./passportHandler');

module.exports = [
    basePostHandlers,
    passportHandler,
];
