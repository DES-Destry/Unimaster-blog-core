const axios = require('axios');
const app = require('../app');
const mongo = require('../lib/mongo-config');
const User = require('../models/User');
const UsernameChangeList = require('../models/UsernameChangeList');

/*
    Verification sending endpoints not tested because they send email and I can't write a test for it.
*/

async function clearDB() {
    const allChanges = await UsernameChangeList.find().populate('user');
    allChanges.forEach(async (change) => {
        if (change.user.username === 'New mock user'
        || change.user.username === 'New frst developer'
        || change.user.username === 'New username') {
            await UsernameChangeList.findByIdAndDelete(change._id);
        }
    });

    await User.deleteMany({ username: 'New mock user' });
    await User.deleteMany({ username: 'New frst developer' });
    await User.deleteMany({ username: 'Not existed user' });
    await User.deleteMany({ email: 'mock@gmail.com' });
    await User.deleteMany({ email: 'first_dev@gmail.com' });
}

async function createMockUserAndGetToken() {
    const username = 'New mock user';
    const email = 'mock@gmail.com';
    const password = '123456789';
    const alias = 'MockyMocky';
    const verified = true;

    const user = new User({
        username,
        email,
        password,
        alias,
        verified,
    });
    user.save();

    return user.genToken();
}

async function createFirstDevAndGetToken() {
    const username = 'New frst developer';
    const email = 'first_dev@gmail.com';
    const privilege = 'First Developer';
    const password = '123456789';
    const verified = true;

    const user = new User({
        username,
        email,
        privilege,
        password,
        verified,
    });
    user.save();

    return user.genToken();
}

beforeAll(() => {
    mongo('test', (err) => {
        if (err) throw err;
    });
});

beforeEach(async (done) => {
    await clearDB();
    done();
});

afterEach(async (done) => {
    await clearDB();
    done();
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

describe('PUT /api/user/username', () => {
    it('Normal username changing', async (done) => {
        const server = app.listen(4014);
        const newUsername = 'New username';

        try {
            const token = await createMockUserAndGetToken();

            const response = await axios({
                url: 'http://localhost:4014/api/user/username',
                method: 'put',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                data: { newUsername },
            });

            expect(response.status).toBe(200);
            expect(response.data.success).toBe(true);
            expect(response.data.content.token).toBeDefined();

            const checkAuth = await axios({
                url: 'http://localhost:4014/api/auth/check',
                method: 'post',
                headers: {
                    'Authorization': `Bearer ${response.data.content.token}`,
                },
            });

            expect(checkAuth.status).toBe(200);
            expect(checkAuth.data.success).toBe(true);
        }
        catch (err) {
            expect(err.response.status).toBe(200);
            expect(err.response.data.success).toBe(true);
            expect(err.response.data.content).toBeDefined();
        }
        finally {
            server.close();
            done();
        }
    });

    it('Username changing: empty stress test', async (done) => {
        const server = app.listen(4015);
        const newUsername = '';

        try {
            const token = await createMockUserAndGetToken();

            const response = await axios({
                url: 'http://localhost:4015/api/user/username',
                method: 'put',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                data: { newUsername },
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

    it('Username changing: empty stress test', async (done) => {
        const server = app.listen(4016);
        const newUsername = 'mock@gmail.com';

        try {
            const token = await createMockUserAndGetToken();

            const response = await axios({
                url: 'http://localhost:4016/api/user/username',
                method: 'put',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                data: { newUsername },
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

    it('Username changing: same usernames stress test', async (done) => {
        const server = app.listen(4017);
        const newUsername = 'New frst developer';

        try {
            await createFirstDevAndGetToken();
            const token = await createMockUserAndGetToken();

            const response = await axios({
                url: 'http://localhost:4017/api/user/username',
                method: 'put',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                data: { newUsername },
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

    it('Username changing: old username stress test', async (done) => {
        const server = app.listen(4018);
        const newUsername = 'New mock user';

        try {
            const token = await createMockUserAndGetToken();

            const response = await axios({
                url: 'http://localhost:4018/api/user/username',
                method: 'put',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                data: { newUsername },
            });

            expect(response.status).toBe(418);
            expect(response.data.success).toBe(false);
            expect(response.data.content).not.toBeDefined();
        }
        catch (err) {
            expect(err.response.status).toBe(418);
            expect(err.response.data.success).toBe(false);
            expect(err.response.data.content).not.toBeDefined();
        }
        finally {
            server.close();
            done();
        }
    });
});

describe('PUT /api/auth/password', () => {
    it('Normal password changing', async (done) => {
        const server = app.listen(4019);
        const oldPassword = '123456789';
        const newPassword = '987654321';

        try {
            const token = await createMockUserAndGetToken();

            const response = await axios({
                url: 'http://localhost:4019/api/user/password',
                method: 'put',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                data: { oldPassword, newPassword },
            });

            expect(response.status).toBe(200);
            expect(response.data.success).toBe(true);
            expect(response.data.content.token).toBeDefined();

            const checkAuth = await axios({
                url: 'http://localhost:4019/api/auth/check',
                method: 'post',
                headers: {
                    'Authorization': `Bearer ${response.data.content.token}`,
                },
            });

            expect(checkAuth.status).toBe(200);
            expect(checkAuth.data.success).toBe(true);
        }
        catch (err) {
            expect(err.response.status).toBe(200);
            expect(err.response.data.success).toBe(true);
            expect(err.response.data.content.token).toBeDefined();
        }
        finally {
            server.close();
            done();
        }
    });

    it('Password changing: empty stress test', async (done) => {
        const server = app.listen(4020);
        const oldPassword = '';
        const newPassword = '';

        try {
            const token = await createMockUserAndGetToken();

            const response = await axios({
                url: 'http://localhost:4020/api/user/password',
                method: 'put',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                data: { oldPassword, newPassword },
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

    it('Password changing: short new password stress test', async (done) => {
        const server = app.listen(4021);
        const oldPassword = '123456789';
        const newPassword = '123';

        try {
            const token = await createMockUserAndGetToken();

            const response = await axios({
                url: 'http://localhost:4021/api/user/password',
                method: 'put',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                data: { oldPassword, newPassword },
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

    it('Password changing: same old and new password stress test', async (done) => {
        const server = app.listen(4022);
        const oldPassword = '123456789';
        const newPassword = '123456789';

        try {
            const token = await createMockUserAndGetToken();

            const response = await axios({
                url: 'http://localhost:4022/api/user/password',
                method: 'put',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                data: { oldPassword, newPassword },
            });

            expect(response.status).toBe(403);
            expect(response.data.success).toBe(false);
            expect(response.data.content).not.toBeDefined();
        }
        catch (err) {
            expect(err.response.status).toBe(403);
            expect(err.response.data.success).toBe(false);
            expect(err.response.data.content).not.toBeDefined();
        }
        finally {
            server.close();
            done();
        }
    });

    it('Password changing: wrong old password stress test', async (done) => {
        const server = app.listen(4023);
        const oldPassword = '987654321';
        const newPassword = '123456789';

        try {
            const token = await createMockUserAndGetToken();

            const response = await axios({
                url: 'http://localhost:4023/api/user/password',
                method: 'put',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                data: { oldPassword, newPassword },
            });

            expect(response.status).toBe(403);
            expect(response.data.success).toBe(false);
            expect(response.data.content).not.toBeDefined();
        }
        catch (err) {
            expect(err.response.status).toBe(403);
            expect(err.response.data.success).toBe(false);
            expect(err.response.data.content).not.toBeDefined();
        }
        finally {
            server.close();
            done();
        }
    });
});

describe('PUT /api/user/alias', () => {
    it('Normal alias changing', async (done) => {
        const server = app.listen(4024);
        const newAlias = 'NewMockyMocky';

        try {
            const token = await createMockUserAndGetToken();

            const response = await axios({
                url: 'http://localhost:4024/api/user/alias',
                method: 'put',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                data: { newAlias },
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

    it('Normal alias changing: clear', async (done) => {
        const server = app.listen(4025);
        const newAlias = '';

        try {
            const token = await createMockUserAndGetToken();

            const response = await axios({
                url: 'http://localhost:4025/api/user/alias',
                method: 'put',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                data: { newAlias },
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

    it('Alias changing: very long stress test', async (done) => {
        const server = app.listen(4026);
        const newAlias = 'Hey. I\'m a SIMP...  Sniper monkey.  Yah, my alias is fucking BIG!!!';

        try {
            const token = await createMockUserAndGetToken();

            const response = await axios({
                url: 'http://localhost:4026/api/user/alias',
                method: 'put',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                data: { newAlias },
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

    it('Alias changing: old and new alias same stress test', async (done) => {
        const server = app.listen(4027);
        const newAlias = 'MockyMocky';

        try {
            const token = await createMockUserAndGetToken();

            const response = await axios({
                url: 'http://localhost:4027/api/user/alias',
                method: 'put',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                data: { newAlias },
            });

            expect(response.status).toBe(418);
            expect(response.data.success).toBe(false);
        }
        catch (err) {
            expect(err.response.status).toBe(418);
            expect(err.response.data.success).toBe(false);
        }
        finally {
            server.close();
            done();
        }
    });
});
