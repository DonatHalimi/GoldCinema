const assert = require('node:assert/strict');
const { after, before, test } = require('node:test');
const express = require('express');
const cookieParser = require('cookie-parser');
const multiRoleRoutes = require('../src/routes/multiRole');
const authRoutes = require('../src/routes/auth');

const app = express();
app.use(cookieParser());
app.use('/api/auth', multiRoleRoutes);
app.use('/api/auth', authRoutes);

let server;
let baseUrl;

before(async () => {
    server = app.listen(0);
    await new Promise((resolve) => server.once('listening', resolve));
    baseUrl = `http://127.0.0.1:${server.address().port}`;
});

after(async () => {
    if (server) await new Promise((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
});

test('the auth profile route returns an API 401 without redirecting', async () => {
    for (const path of ['/api/auth/me', '/api/auth/me/']) {
        const response = await fetch(`${baseUrl}${path}`, { redirect: 'manual' });

        assert.equal(response.status, 401);
        assert.equal(response.headers.get('location'), null);
    }
});

test('logout is idempotent when the session cookie is already absent', async () => {
    const response = await fetch(`${baseUrl}/api/auth/logout`, { method: 'POST' });

    assert.equal(response.status, 200);
});
