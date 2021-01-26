const basePostHandlers = require('./basePostHandlers');
const passportHandler = require('./passportHandler');
const corsHandler = require('./corsHandler');
const staticHandler = require('./staticHandler');

module.exports = [
    basePostHandlers,
    passportHandler,
    corsHandler,
    staticHandler,
];
