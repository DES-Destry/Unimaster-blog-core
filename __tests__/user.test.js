const axios = require('axios');
const app = require('../app');
const mongo = require('../lib/mongo-config');
const User = require('../models/User');

/*
    Verification sending endpoints not tested because they send email and I can't write a test for it.
*/

async function createMockUserAndGetToken() {
    const username = 'New mock user';
    const email = 'mock@gmail.com';
    const password = '123456789';

    const user = new User({ username, email, password });
    user.save();

    return user.genToken();
}

async function createFirstDevAndGetToken() {
    const username = 'New frst developer';
    const email = 'first_dev@gmail.com';
    const privilege = 'First Developer';
    const password = '123456789';

    const user = new User({
        username,
        email,
        privilege,
        password,
    });
    user.save();

    return user.genToken();
}

beforeAll(() => {
    mongo('test', (err) => {
        if (err) throw err;
    });
});

afterEach(async () => {
    await User.deleteMany({ username: 'New mock user' });
    await User.deleteMany({ username: 'New frst developer' });
    await User.deleteMany({ username: 'Not existed user' });
    await User.deleteMany({ email: 'mock@gmail.com' });
    await User.deleteMany({ email: 'first_dev@gmail.com' });
});

describe('PUT /api/user/description', () => {
    it('Users description changing', async (done) => {
        const server = app.listen(4001);
        const newDescription = 'Some very cool description!';

        try {
            const token = await createMockUserAndGetToken();

            const response = await axios({
                url: 'http://localhost:4001/api/user/description',
                method: 'put',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                data: { newDescription },
            });

            expect(response.status).toBe(200);
            expect(response.data.success).toBe(true);
            expect(response.data.content.newDescription).toBe(newDescription);
        }
        catch (err) {
            expect(err.response.status).toBe(200);
            expect(err.response.data.success).toBe(true);
            expect(err.response.data.content.newDescription).toBe(newDescription);
        }
        finally {
            server.close();
            done();
        }
    });

    it('Empty new description stress test', async (done) => {
        const server = app.listen(4002);
        const newDescription = '';

        try {
            const token = await createMockUserAndGetToken();

            const response = await axios({
                url: 'http://localhost:4002/api/user/description',
                method: 'put',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                data: { newDescription },
            });

            expect(response.status).toBe(400);
            expect(response.data.success).toBe(false);
        }
        catch (err) {
            expect(err.response.status).toBe(400);
            expect(err.response.data.success).toBe(false);
        }
        finally {
            server.close();
            done();
        }
    });
});

describe('PUT /api/user/location', () => {
    it('Users location changing', async (done) => {
        const server = app.listen(4003);
        const newLocation = 'North Korea';

        try {
            const token = await createMockUserAndGetToken();

            const response = await axios({
                url: 'http://localhost:4003/api/user/location',
                method: 'put',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                data: { newLocation },
            });

            expect(response.status).toBe(200);
            expect(response.data.success).toBe(true);
        }
        catch (err) {
            expect(err.response.status).toBe(200);
            expect(err.response.data.success).toBe(true);
        }
        finally {
            server.close();
            done();
        }
    });
});

describe('PUT /api/user/privilege', () => {
    it('Users privilege changing to Moderator', async (done) => {
        const server = app.listen(4004);

        const newPrivilege = 'Moderator';
        const usernameToSet = 'New mock user';

        try {
            const token = await createFirstDevAndGetToken();
            await createMockUserAndGetToken();

            const response = await axios({
                url: 'http://localhost:4004/api/user/privilege',
                method: 'put',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                data: { newPrivilege, usernameToSet },
            });

            expect(response.status).toBe(200);
            expect(response.data.success).toBe(true);
        }
        catch (err) {
            expect(err.response.status).toBe(200);
            expect(err.response.data.success).toBe(true);
        }
        finally {
            server.close();
            done();
        }
    });

    it('Users privilege changing empty stress test', async (done) => {
        const server = app.listen(4005);
        const newPrivilege = '';
        const usernameToSet = '';

        try {
            const token = await createFirstDevAndGetToken();
            await createMockUserAndGetToken();

            const response = await axios({
                url: 'http://localhost:4005/api/user/privilege',
                method: 'put',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                data: { newPrivilege, usernameToSet },
            });

            expect(response.status).toBe(400);
            expect(response.data.success).toBe(false);
        }
        catch (err) {
            expect(err.response.status).toBe(400);
            expect(err.response.data.success).toBe(false);
        }
        finally {
            server.close();
            done();
        }
    });

    it('Users privilege changing scoreable privilege stress test', async (done) => {
        const server = app.listen(4006);
        const newPrivilege = 'Proffesional';
        const usernameToSet = 'New mock user';

        try {
            const token = await createFirstDevAndGetToken();
            await createMockUserAndGetToken();

            const response = await axios({
                url: 'http://localhost:4006/api/user/privilege',
                method: 'put',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                data: { newPrivilege, usernameToSet },
            });

            expect(response.status).toBe(403);
            expect(response.data.success).toBe(false);
        }
        catch (err) {
            expect(err.response.status).toBe(403);
            expect(err.response.data.success).toBe(false);
        }
        finally {
            server.close();
            done();
        }
    });

    it('Users privilege changing incorrect privilege stress test', async (done) => {
        const server = app.listen(4007);
        const newPrivilege = 'Proffessional';
        const usernameToSet = 'New mock user';

        try {
            const token = await createFirstDevAndGetToken();
            await createMockUserAndGetToken();

            const response = await axios({
                url: 'http://localhost:4007/api/user/privilege',
                method: 'put',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                data: { newPrivilege, usernameToSet },
            });

            expect(response.status).toBe(400);
            expect(response.data.success).toBe(false);
            expect(response.data.msg).toBe('Incorrect privilege to set');
        }
        catch (err) {
            expect(err.response.status).toBe(400);
            expect(err.response.data.success).toBe(false);
            expect(err.response.data.msg).toBe('Incorrect privilege to set');
        }
        finally {
            server.close();
            done();
        }
    });

    it('Users privilege changing incorrect username stress test', async (done) => {
        const server = app.listen(4008);
        const newPrivilege = 'Proffesional';
        const usernameToSet = 'Not existed user';

        try {
            const token = await createFirstDevAndGetToken();

            const response = await axios({
                url: 'http://localhost:4008/api/user/privilege',
                method: 'put',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                data: { newPrivilege, usernameToSet },
            });

            expect(response.status).toBe(400);
            expect(response.data.success).toBe(false);
            expect(response.data.msg).toBe('Incorrect username for search');
        }
        catch (err) {
            expect(err.response.status).toBe(400);
            expect(err.response.data.success).toBe(false);
            expect(err.response.data.msg).toBe('Incorrect username for search');
        }
        finally {
            server.close();
            done();
        }
    });
});

describe('POST /api/user/links', () => {
    it('Users links changing', async (done) => {
        const server = app.listen(4009);
        const links = [
            {
                site: 'VK',
                link: 'vk.com/some_id',
            },
        ];

        try {
            const token = await createMockUserAndGetToken();

            const response = await axios({
                url: 'http://localhost:4009/api/user/links',
                method: 'post',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                data: { links },
            });

            expect(response.status).toBe(200);
            expect(response.data.success).toBe(true);
        }
        catch (err) {
            expect(err.response.status).toBe(200);
            expect(err.response.data.success).toBe(true);
        }
        finally {
            server.close();
            done();
        }
    });

    it('Users links rubbish stress test', async (done) => {
        const server = app.listen(4010);
        const links = 'Some rubbish';

        try {
            const token = await createMockUserAndGetToken();

            const response = await axios({
                url: 'http://localhost:4010/api/user/links',
                method: 'post',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                data: { links },
            });

            expect(response.status).toBe(400);
            expect(response.data.success).toBe(false);
        }
        catch (err) {
            expect(err.response.status).toBe(400);
            expect(err.response.data.success).toBe(false);
        }
        finally {
            server.close();
            done();
        }
    });
});

describe('DELETE /api/user/', () => {
    it('Normal deletion', async (done) => {
        const server = app.listen(4011);

        try {
            const token = await createMockUserAndGetToken();

            const response = await axios({
                url: 'http://localhost:4011/api/user/',
                method: 'delete',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                data: { login: 'mock@gmail.com', password: '123456789' },
            });

            expect(response.status).toBe(200);
            expect(response.data.success).toBe(true);
            expect(response.data.content.deleted.username).toBe('New mock user');
            expect(response.data.content.deleted.email).toBe('mock@gmail.com');
        }
        catch (err) {
            expect(err.response.status).toBe(200);
            expect(err.response.data.success).toBe(true);
            expect(err.response.data.content.deleted.username).toBe('New mock user');
            expect(err.response.data.content.deleted.email).toBe('mock@gmail.com');
        }
        finally {
            server.close();
            done();
        }
    });

    it('Deletion by First Developer', async (done) => {
        const server = app.listen(4012);

        try {
            const token = await createFirstDevAndGetToken();
            await createMockUserAndGetToken();

            const response = await axios({
                url: 'http://localhost:4012/api/user/',
                method: 'delete',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                data: { login: 'mock@gmail.com', password: '123456789' },
            });

            expect(response.status).toBe(200);
            expect(response.data.success).toBe(true);
            expect(response.data.content.deleted.username).toBe('New mock user');
            expect(response.data.content.deleted.email).toBe('mock@gmail.com');
        }
        catch (err) {
            expect(err.response.status).toBe(200);
            expect(err.response.data.success).toBe(true);
            expect(err.response.data.content.deleted.username).toBe('New mock user');
            expect(err.response.data.content.deleted.email).toBe('mock@gmail.com');
        }
        finally {
            server.close();
            done();
        }
    });

    it('Deletion with reply with incorrect credentials', async (done) => {
        const server = app.listen(4013);

        try {
            const token = await createMockUserAndGetToken();
            await createFirstDevAndGetToken();

            const response = await axios({
                url: 'http://localhost:4013/api/user/',
                method: 'delete',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                data: { login: 'first_dev@gmail.com', password: 'Some rubbish' },
            });

            expect(response.status).toBe(403);
            expect(response.data.success).toBe(false);
        }
        catch (err) {
            expect(err.response.status).toBe(403);
            expect(err.response.data.success).toBe(false);
        }
        finally {
            server.close();
            done();
        }
    });
});
