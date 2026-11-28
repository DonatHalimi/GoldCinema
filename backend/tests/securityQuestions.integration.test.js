process.env.MONGO_URI = process.env.TEST_MONGO_URI || 'mongodb://127.0.0.1:27017/goldcinema_main';
process.env.JWT_SECRET = process.env.JWT_SECRET || 'goldcinema-security-questions-integration-secret';
process.env.JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || process.env.JWT_SECRET;
process.env.NODE_ENV = 'test';
process.env.CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:3000';

const test = require('node:test');
const assert = require('node:assert/strict');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { connectDB, disconnectDB } = require('../src/config/db');
const app = require('../src/app');
const User = require('../src/models/user');
const UserSecurityQuestions = require('../src/models/userSecurityQuestions');
const RecoveryToken = require('../src/models/securityQuestionRecoveryToken');
const RecoveryAttempt = require('../src/models/securityQuestionRecoveryAttempt');

let server;
let baseUrl;
let databaseAvailable = true;
let user;
let authToken;
let refreshCookieToken;

const questions = [
    { questionText: 'What was the name of your first school?', answer: 'North High' },
    { questionText: 'What was the name of your first pet?', answer: 'Milo' },
    { questionText: 'In which city did your parents meet?', answer: 'Prizren' },
];

async function request(path, options = {}) {
    return fetch(`${baseUrl}${path}`, {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            Origin: 'http://localhost:3000',
            ...(options.headers || {}),
        },
    });
}

test.before(async () => {
    try {
        await connectDB();
    } catch (error) {
        databaseAvailable = false;
        console.warn(`[securityQuestions.integration] MongoDB unavailable: ${error.message}`);
        return;
    }

    server = app.listen(0);
    await new Promise((resolve) => server.once('listening', resolve));
    baseUrl = `http://127.0.0.1:${server.address().port}`;
});

test.beforeEach(async () => {
    if (!databaseAvailable) return;
    const suffix = `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    user = await User.create({
        name: `Recovery Tester ${suffix}`,
        email: `recovery_${suffix}@example.com`,
        passwordHash: await bcrypt.hash('CurrentPassword123!', 12),
        emailVerified: true,
        isActive: true,
    });
    refreshCookieToken = `test-refresh-${user._id}`;
    user.refreshTokens.push({ token: refreshCookieToken, expiresAt: new Date(Date.now() + 60 * 60 * 1000) });
    await user.save();
    authToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
});

test.afterEach(async () => {
    if (!databaseAvailable || !user) return;
    await Promise.all([
        UserSecurityQuestions.deleteMany({ user: user._id }),
        RecoveryToken.deleteMany({ user: user._id }),
        RecoveryAttempt.deleteMany({}),
        User.deleteOne({ _id: user._id }),
    ]);
    user = null;
});

test.after(async () => {
    if (server) await new Promise((resolve) => server.close(resolve));
    if (databaseAvailable) await disconnectDB();
});

test('setup, safe lookup, failed verification, success, password reset and token replay rejection', async (t) => {
    if (!databaseAvailable) return t.skip('MongoDB is not reachable; integration flow requires a MongoDB instance.');

    const setup = await request('/api/account/security-questions', {
        method: 'PUT',
        headers: { Authorization: `Bearer ${authToken}`, Cookie: `refreshToken=${refreshCookieToken}` },
        body: JSON.stringify({ currentPassword: 'CurrentPassword123!', questions }),
    });
    assert.equal(setup.status, 200);

    const list = await request('/api/account/security-questions', {
        headers: { Authorization: `Bearer ${authToken}`, Cookie: `refreshToken=${refreshCookieToken}` },
    });
    assert.equal(list.status, 200);
    const listBody = await list.json();
    assert.equal(listBody.questions.length, 3);
    assert.equal(JSON.stringify(listBody).includes('answerHash'), false);

    const init = await request('/api/auth/recovery/questions/init', {
        method: 'POST',
        body: JSON.stringify({ emailOrUsername: user.email }),
    });
    assert.equal(init.status, 200);
    const initBody = await init.json();
    assert.equal(initBody.questions.length, 3);

    const wrongAnswers = initBody.questions.map((question) => ({ questionId: question.questionId, answer: 'incorrect' }));
    const failed = await request('/api/auth/recovery/questions/verify', {
        method: 'POST',
        body: JSON.stringify({ emailOrUsername: user.email, answers: wrongAnswers }),
    });
    assert.equal(failed.status, 400);
    assert.equal((await failed.json()).error, 'One or more answers did not match.');

    const correctAnswers = initBody.questions.map((question, index) => ({ questionId: question.questionId, answer: questions[index].answer }));
    const verified = await request('/api/auth/recovery/questions/verify', {
        method: 'POST',
        body: JSON.stringify({ emailOrUsername: user.email, answers: correctAnswers }),
    });
    assert.equal(verified.status, 200);
    const { verificationToken } = await verified.json();
    assert.ok(verificationToken);

    const reset = await request('/api/auth/reset-password', {
        method: 'POST',
        body: JSON.stringify({ token: verificationToken, password: 'NewPassword123!' }),
    });
    assert.equal(reset.status, 200);

    const replay = await request('/api/auth/reset-password', {
        method: 'POST',
        body: JSON.stringify({ token: verificationToken, password: 'AnotherPassword123!' }),
    });
    assert.equal(replay.status, 400);
    assert.equal(await bcrypt.compare('NewPassword123!', (await User.findById(user._id)).passwordHash), true);
});


test('five failed recovery attempts lock the account and IP for 15 minutes', async (t) => {
    if (!databaseAvailable) return t.skip('MongoDB is not reachable; integration flow requires a MongoDB instance.');

    const setup = await request('/api/account/security-questions', {
        method: 'PUT',
        headers: { Authorization: `Bearer ${authToken}`, Cookie: `refreshToken=${refreshCookieToken}` },
        body: JSON.stringify({ currentPassword: 'CurrentPassword123!', questions }),
    });
    assert.equal(setup.status, 200);

    const init = await request('/api/auth/recovery/questions/init', {
        method: 'POST',
        body: JSON.stringify({ emailOrUsername: user.email }),
    });
    const prompts = (await init.json()).questions;
    const badAnswers = prompts.map((question) => ({ questionId: question.questionId, answer: 'not-the-answer' }));

    for (let attempt = 0; attempt < 5; attempt += 1) {
        const response = await request('/api/auth/recovery/questions/verify', {
            method: 'POST',
            body: JSON.stringify({ emailOrUsername: user.email, answers: badAnswers }),
        });
        assert.equal(response.status, 400);
    }

    const locked = await request('/api/auth/recovery/questions/verify', {
        method: 'POST',
        body: JSON.stringify({ emailOrUsername: user.email, answers: badAnswers }),
    });
    assert.equal(locked.status, 429);
    assert.ok(Number(locked.headers.get('retry-after')) > 0);
});


test('security-question deletion requires password confirmation and removes the configured set', async (t) => {
    if (!databaseAvailable) return t.skip('MongoDB is not reachable; integration flow requires a MongoDB instance.');

    const setup = await request('/api/account/security-questions', {
        method: 'PUT',
        headers: { Authorization: `Bearer ${authToken}`, Cookie: `refreshToken=${refreshCookieToken}` },
        body: JSON.stringify({ currentPassword: 'CurrentPassword123!', questions }),
    });
    assert.equal(setup.status, 200);

    const rejected = await request('/api/account/security-questions', {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${authToken}`, Cookie: `refreshToken=${refreshCookieToken}` },
        body: JSON.stringify({ currentPassword: 'wrong-password' }),
    });
    assert.equal(rejected.status, 401);

    const removed = await request('/api/account/security-questions', {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${authToken}`, Cookie: `refreshToken=${refreshCookieToken}` },
        body: JSON.stringify({ currentPassword: 'CurrentPassword123!' }),
    });
    assert.equal(removed.status, 200);

    const listed = await request('/api/account/security-questions', {
        headers: { Authorization: `Bearer ${authToken}`, Cookie: `refreshToken=${refreshCookieToken}` },
    });
    assert.deepEqual((await listed.json()).questions, []);
});


test('updating questions invalidates previously issued recovery grants', async (t) => {
    if (!databaseAvailable) return t.skip('MongoDB is not reachable; integration flow requires a MongoDB instance.');

    const setup = await request('/api/account/security-questions', {
        method: 'PUT',
        headers: { Authorization: `Bearer ${authToken}`, Cookie: `refreshToken=${refreshCookieToken}` },
        body: JSON.stringify({ currentPassword: 'CurrentPassword123!', questions }),
    });
    assert.equal(setup.status, 200);

    const init = await request('/api/auth/recovery/questions/init', {
        method: 'POST',
        body: JSON.stringify({ emailOrUsername: user.email }),
    });
    const prompts = (await init.json()).questions;
    const correctAnswers = prompts.map((question, index) => ({ questionId: question.questionId, answer: questions[index].answer }));
    const verified = await request('/api/auth/recovery/questions/verify', {
        method: 'POST',
        body: JSON.stringify({ emailOrUsername: user.email, answers: correctAnswers }),
    });
    assert.equal(verified.status, 200);
    const { verificationToken } = await verified.json();

    const updatedQuestions = questions.map((question, index) => ({
        questionText: [
            'What was the first library you visited?',
            'What was the first sport you played?',
            'What was the first city you travelled to?',
        ][index],
        answer: `${question.answer}-updated`,
    }));
    const updated = await request('/api/account/security-questions', {
        method: 'PUT',
        headers: { Authorization: `Bearer ${authToken}`, Cookie: `refreshToken=${refreshCookieToken}` },
        body: JSON.stringify({ currentPassword: 'CurrentPassword123!', questions: updatedQuestions }),
    });
    assert.equal(updated.status, 200);

    const staleGrant = await request('/api/auth/reset-password', {
        method: 'POST',
        body: JSON.stringify({ token: verificationToken, password: 'NewPassword123!' }),
    });
    assert.equal(staleGrant.status, 400);
    assert.equal(await bcrypt.compare('CurrentPassword123!', (await User.findById(user._id)).passwordHash), true);
});
