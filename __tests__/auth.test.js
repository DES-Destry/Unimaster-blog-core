const axios = require('axios');
const app = require('../app');
const mongo = require('../lib/mongo-config');
const User = require('../models/User');
const VerificationUser = require('../models/VerificationUser');

beforeAll(() => {
    mongo('test', (err) => {
        if (err) throw err;
    });
});

afterEach(async () => {
    await User.deleteMany({ email: 'mock@email.com' });
    await User.deleteMany({ username: 'New mock user' });
    await User.deleteMany({ username: 'Existed mock user' });
    await User.deleteMany({ username: 'This user not exist' });
});

describe('POST /api/auth/registrate', () => {
    it('Normal registration', async (done) => {
        const server = app.listen(5001);

        const username = 'New mock user';
        const email = 'mock@gmail.com';
        const password = '123456789';

        try {
            const response = await axios({
                url: 'http://localhost:5001/api/auth/registrate',
                method: 'post',
                headers: {
                    'Content-Type': 'application/json',
                },
                data: { username, email, password },
            });

            expect(response.status).toBe(200);
            expect(response.data.success).toBe(true);
        }
        catch (err) {
            expect(err.response.status).toBe(200);
        }
        finally {
            const user = await User.findOne({ username });
            if (user) {
                await VerificationUser.deleteOne({ user: user._id });
                await User.deleteOne({ username });
            }

            server.close();
            done();
        }
    });

    it('Registrate with username, that already exists in blog', async (done) => {
        const server = app.listen(5002);

        const username = 'Existed mock user';
        const email = 'mock@email.com';
        const password = '123456789';

        const mockUser = new User({ username, email, password });
        mockUser.save();

        try {
            const response = await axios({
                url: 'http://localhost:5002/api/auth/registrate',
                method: 'post',
                headers: {
                    'Content-Type': 'application/json',
                },
                data: { username, email, password },
            });

            expect(response.status).toBe(403);
            expect(response.data.success).toBe(false);
        }
        catch (err) {
            expect(err.response.status).toBe(403);
            expect(err.response.data.success).toBe(false);
        }
        finally {
            await VerificationUser.deleteOne({ user: mockUser._id });
            await User.findByIdAndDelete(mockUser._id);

            server.close();
            done();
        }
    });

    it('Registrate with very short password', async (done) => {
        const server = app.listen(5003);

        const username = 'New mock user';
        const email = 'mock@email.com';
        const password = '1234567';

        try {
            const response = await axios({
                url: 'http://localhost:5003/api/auth/registrate',
                method: 'post',
                headers: {
                    'Content-Type': 'application/json',
                },
                data: { username, email, password },
            });

            expect(response.status).toBe(400);
            expect(response.data.success).toBe(false);
        }
        catch (err) {
            expect(err.response.status).toBe(400);
            expect(err.response.data.success).toBe(false);
        }
        finally {
            const user = await User.findOne({ username });
            if (user) {
                await VerificationUser.deleteOne({ user: user._id });
                await User.deleteOne({ username });
            }

            server.close();
            done();
        }
    });

    it('Registrate with email and username swithed', async (done) => {
        const server = app.listen(5004);

        const username = 'mock@email.com';
        const email = 'New mock user';
        const password = '123456789';

        try {
            const response = await axios({
                url: 'http://localhost:5004/api/auth/registrate',
                method: 'post',
                headers: {
                    'Content-Type': 'application/json',
                },
                data: { username, email, password },
            });

            expect(response.status).toBe(400);
            expect(response.data.success).toBe(false);
        }
        catch (err) {
            expect(err.response.status).toBe(400);
            expect(err.response.data.success).toBe(false);
        }
        finally {
            const user = await User.findOne({ username });
            if (user) {
                await VerificationUser.deleteOne({ user: user._id });
                await User.deleteOne({ username });
            }

            server.close();
            done();
        }
    });
});

describe('POST /api/auth/login', () => {
    it('Normal login with username', async (done) => {
        const server = app.listen(5005);

        const username = 'New mock user';
        const email = 'mock@email.com';
        const password = '123456789';

        const mockUser = new User({ username, email, password });
        mockUser.save();

        try {
            const login = username;
            const response = await axios({
                url: 'http://localhost:5005/api/auth/login',
                method: 'post',
                headers: {
                    'Content-Type': 'application/json',
                },
                data: { login, password },
            });

            expect(response.status).toBe(200);
            expect(response.data.success).toBe(true);
            expect(response.data.token).not.toBeNull();
        }
        catch (err) {
            expect(err.response.status).toBe(200);
            expect(err.response.data.success).toBe(true);
            expect(err.response.data.token).not.toBeNull();
        }
        finally {
            await VerificationUser.deleteOne({ user: mockUser._id });
            await User.findByIdAndDelete(mockUser._id);

            server.close();
            done();
        }
    });

    it('Normal login with email', async (done) => {
        const server = app.listen(5006);

        const username = 'New mock user';
        const email = 'mock@email.com';
        const password = '123456789';

        const mockUser = new User({ username, email, password });
        mockUser.save();

        try {
            const login = email;
            const response = await axios({
                url: 'http://localhost:5006/api/auth/login',
                method: 'post',
                headers: {
                    'Content-Type': 'application/json',
                },
                data: { login, password },
            });

            expect(response.status).toBe(200);
            expect(response.data.success).toBe(true);
            expect(response.data.token).not.toBeNull();
        }
        catch (err) {
            expect(err.response.status).toBe(200);
            expect(err.response.data.success).toBe(true);
            expect(err.response.data.token).not.toBeNull();
        }
        finally {
            await VerificationUser.deleteOne({ user: mockUser._id });
            await User.findByIdAndDelete(mockUser._id);

            server.close();
            done();
        }
    });

    it('Login with wrong username', async (done) => {
        const server = app.listen(5007);

        const login = 'This user not exist';
        const password = '123654789';

        try {
            const response = await axios({
                url: 'http://localhost:5007/api/auth/login',
                method: 'post',
                headers: {
                    'Content-Type': 'application/json',
                },
                data: { login, password },
            });

            expect(response.status).toBe(401);
            expect(response.data.success).toBe(false);
            expect(response.data.token).not.toBeDefined();
        }
        catch (err) {
            expect(err.response.status).toBe(401);
            expect(err.response.data.success).toBe(false);
            expect(err.response.data.token).not.toBeDefined();
        }
        finally {
            server.close();
            done();
        }
    });

    it('Login with wrong password', async (done) => {
        const server = app.listen(5008);

        const username = 'New mock user';
        const email = 'mock@email.com';
        const password = '123456789';

        const mockUser = new User({ username, email, password });
        mockUser.save();

        try {
            const login = username;
            const inputPassword = 'WRONG PASSWORD'; // Not 123456789

            const response = await axios({
                url: 'http://localhost:5008/api/auth/login',
                method: 'post',
                headers: {
                    'Content-Type': 'application/json',
                },
                data: { login, password: inputPassword },
            });

            expect(response.status).toBe(401);
            expect(response.data.success).toBe(false);
            expect(response.data.token).not.toBeDefined();
        }
        catch (err) {
            expect(err.response.status).toBe(401);
            expect(err.response.data.success).toBe(false);
            expect(err.response.data.token).not.toBeDefined();
        }
        finally {
            await VerificationUser.deleteOne({ user: mockUser._id });
            await User.findByIdAndDelete(mockUser._id);

            server.close();
            done();
        }
    });
});
