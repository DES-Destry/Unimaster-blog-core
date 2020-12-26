const cors = require('cors');

const options = {
    origin: '*',
    optionsSuccessStatus: 200,
};

module.exports = (app) => {
    app.use(cors(options));
};
