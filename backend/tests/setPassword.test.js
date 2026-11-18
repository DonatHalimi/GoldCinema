const test = require('node:test');
const assert = require('node:assert/strict');
const User = require('../src/models/user');
const { setPassword } = require('../src/controllers/auth');

test('initial password setup requires a connected provider and accepts any provider count', async () => {
    const originalFindById = User.findById;

    try {
        const oauthIdentities = [
            { provider: 'google' },
            { provider: 'facebook' },
        ];
        let statusCode;
        let responseBody;
        let savedUser;
        const user = {
            oauthIdentities,
            authProviders: oauthIdentities.map(({ provider }) => provider),
            passwordHash: null,
            async save() {
                savedUser = this;
            },
        };
        const response = {
            status(code) {
                statusCode = code;
                return this;
            },
            json(body) {
                responseBody = body;
                return this;
            },
        };

        User.findById = () => ({
            select: async () => user,
        });

        await setPassword(
            { user: { id: 'user-123' }, body: { password: 'valid-password' }, headers: {}, socket: {} },
            response,
            (error) => assert.ifError(error)
        );

        assert.equal(statusCode, undefined);
        assert.equal(responseBody.hasPassword, true);
        assert.ok(savedUser.passwordHash);
        assert.ok(savedUser.authProviders.includes('password'));

        User.findById = () => ({
            select: async () => ({
                oauthIdentities: [],
                authProviders: [],
                passwordHash: null,
            }),
        });

        statusCode = undefined;
        responseBody = undefined;
        await setPassword(
            { user: { id: 'user-123' }, body: { password: 'valid-password' } },
            response,
            (error) => assert.ifError(error)
        );

        assert.equal(statusCode, 409);
        assert.match(responseBody.error, /at least one social account/);
    } finally {
        User.findById = originalFindById;
    }
});
