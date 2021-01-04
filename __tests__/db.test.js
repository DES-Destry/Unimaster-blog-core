const mongo = require('../lib/mongo-config');

beforeAll(async () => {
    mongo((err) => {
        if (err) {
            expect(() => true).toBe(false);
            return;
        }

        console.log('Jest to mongo has been connected!');
    });
});
