const test = require('node:test');
const assert = require('node:assert/strict');
const {
    googleLinkStart,
} = require('../src/controllers/googleAuth');

test('Google account linking redirects to OAuth with a session-bound state', () => {
    const previousEnv = {
        GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
        GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
        GOOGLE_CALLBACK_URL: process.env.GOOGLE_CALLBACK_URL,
        JWT_SECRET: process.env.JWT_SECRET,
        CLIENT_URL: process.env.CLIENT_URL,
    };

    process.env.GOOGLE_CLIENT_ID = 'test-client-id';
    process.env.GOOGLE_CLIENT_SECRET = 'test-client-secret';
    process.env.GOOGLE_CALLBACK_URL = 'http://localhost:4000/api/auth/google/callback';
    process.env.JWT_SECRET = 'test-jwt-secret';
    process.env.CLIENT_URL = 'http://localhost:3000';

    try {
        let redirectUrl;
        let savedCookie;
        const req = {
            user: { id: 'user-123' },
            cookies: { refreshToken: 'refresh-token' },
        };
        const res = {
            cookie(name, value, options) {
                savedCookie = { name, value, options };
                return this;
            },
            redirect(url) {
                redirectUrl = url;
                return this;
            },
        };

        googleLinkStart(req, res);

        const authorizeUrl = new URL(redirectUrl);
        const stateCookie = JSON.parse(savedCookie.value);
        assert.equal(authorizeUrl.origin, 'https://accounts.google.com');
        assert.equal(authorizeUrl.searchParams.get('redirect_uri'), process.env.GOOGLE_CALLBACK_URL);
        assert.equal(authorizeUrl.searchParams.get('prompt'), 'select_account');
        assert.deepEqual(
            authorizeUrl.searchParams.get('scope').split(' '),
            ['openid', 'email', 'profile']
        );
        assert.equal(authorizeUrl.searchParams.get('state'), stateCookie.state);
        assert.equal(stateCookie.intent, 'link');
        assert.equal(stateCookie.userId, 'user-123');
        assert.ok(stateCookie.refreshTokenHash);
        assert.ok(stateCookie.signature);
        assert.equal(savedCookie.options.httpOnly, true);
        assert.equal(savedCookie.options.sameSite, 'lax');
    } finally {
        for (const [key, value] of Object.entries(previousEnv)) {
            if (value === undefined) delete process.env[key];
            else process.env[key] = value;
        }
    }
});
