const test = require('node:test');
const assert = require('node:assert/strict');
const { assertCanUnlinkProvider } = require('../src/services/socialAuth');

test('disconnecting a provider requires a password even if another provider remains', () => {
    const user = {
        oauthIdentities: [
            { provider: 'google' },
            { provider: 'github' },
        ],
        authProviders: ['google', 'github'],
        passkeys: [],
        passwordHash: null,
    };

    assert.throws(
        () => assertCanUnlinkProvider(user, 'github'),
        (error) => error.status === 409 && error.publicCode === 'password_required'
    );
});

test('disconnecting the last provider also requires a password', () => {
    const user = {
        oauthIdentities: [{ provider: 'google' }],
        authProviders: ['google'],
        passkeys: [{ credentialId: 'existing-passkey' }],
        passwordHash: null,
    };

    assert.throws(
        () => assertCanUnlinkProvider(user, 'google'),
        (error) => error.status === 409 && error.publicCode === 'password_required'
    );
});

test('a provider can be disconnected after a password is configured', () => {
    const user = {
        oauthIdentities: [{ provider: 'google' }],
        authProviders: ['google'],
        passkeys: [],
        passwordHash: 'stored-hash',
    };

    assert.doesNotThrow(() => assertCanUnlinkProvider(user, 'google'));
});
