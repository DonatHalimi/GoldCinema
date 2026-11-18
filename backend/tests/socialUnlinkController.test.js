const test = require('node:test');
const assert = require('node:assert/strict');
const bcrypt = require('bcryptjs');
const { authenticator } = require('@otplib/preset-default');
const User = require('../src/models/user');
const notificationUtils = require('../src/utils/notifications');

notificationUtils.createNotification = async () => null;
const {
    sendUnlinkVerificationCode,
    unlinkSocialAccount,
} = require('../src/controllers/socialAccounts');

test('email and SMS unlink codes require a valid password before sending', async () => {
    const originalFindById = User.findById;
    const user = {
        _id: 'user-123',
        passwordHash: await bcrypt.hash('valid-current-password', 4),
        authProviders: ['google'],
        oauthIdentities: [
            { provider: 'google', providerUserId: 'google-123' },
        ],
        twoFactor: { enabled: true, methods: ['email', 'sms'] },
        socialAccountOtpSentAt: null,
    };

    try {
        User.findById = () => ({
            select: async () => user,
        });

        for (const method of ['email', 'sms']) {
            let responseStatus;
            let responseBody;
            await sendUnlinkVerificationCode(
                {
                    user: { id: user._id },
                    params: { provider: 'google' },
                    body: { method, currentPassword: 'wrong-password' },
                },
                {
                    status(code) {
                        responseStatus = code;
                        return this;
                    },
                    json(body) {
                        responseBody = body;
                        return this;
                    },
                },
                (error) => assert.ifError(error)
            );

            assert.equal(responseStatus, 401);
            assert.equal(responseBody.error, 'Incorrect current password.');
        }
    } finally {
        User.findById = originalFindById;
    }
});

test('unlink with 2FA requires both the password and a valid authenticator code', async () => {
    const originalFindById = User.findById;
    const password = 'valid-current-password';
    const totpSecret = authenticator.generateSecret();
    const user = {
        _id: 'user-123',
        email: 'user@example.com',
        passwordHash: await bcrypt.hash(password, 4),
        authProviders: ['google', 'facebook'],
        oauthIdentities: [
            { provider: 'google', providerUserId: 'google-123' },
            { provider: 'facebook', providerUserId: 'facebook-123' },
        ],
        twoFactor: {
            enabled: true,
            methods: ['totp'],
            totpSecret,
        },
        passkeys: [],
        securityEvents: [],
        async save() {},
    };

    try {
        User.findById = () => ({
            select: async () => user,
        });

        let responseBody;
        let responseStatus;
        const response = {
            status(code) {
                responseStatus = code;
                return this;
            },
            json(body) {
                responseBody = body;
                return this;
            },
        };
        let nextError;

        await unlinkSocialAccount(
            {
                user: { id: user._id },
                params: { provider: 'google' },
                body: {
                    currentPassword: password,
                    method: 'totp',
                    code: authenticator.generate(totpSecret),
                },
                headers: {},
                socket: {},
            },
            response,
            (error) => {
                nextError = error;
            }
        );

        assert.ifError(nextError);
        assert.equal(responseStatus, undefined);
        assert.equal(responseBody.message, 'google account disconnected successfully.');
        assert.deepEqual(user.authProviders, ['facebook']);
        assert.equal(user.oauthIdentities.length, 1);
        assert.equal(user.oauthIdentities[0].provider, 'facebook');
    } finally {
        User.findById = originalFindById;
    }
});

test('unlink with 2FA rejects a missing OTP even when password is valid', async () => {
    const originalFindById = User.findById;
    const user = {
        _id: 'user-123',
        passwordHash: await bcrypt.hash('valid-current-password', 4),
        authProviders: ['google', 'facebook'],
        oauthIdentities: [
            { provider: 'google', providerUserId: 'google-123' },
            { provider: 'facebook', providerUserId: 'facebook-123' },
        ],
        twoFactor: {
            enabled: true,
            methods: ['totp'],
            totpSecret: authenticator.generateSecret(),
        },
        passkeys: [],
        securityEvents: [],
    };

    try {
        User.findById = () => ({
            select: async () => user,
        });

        let nextError;
        await unlinkSocialAccount(
            {
                user: { id: user._id },
                params: { provider: 'google' },
                body: {
                    currentPassword: 'valid-current-password',
                    method: 'totp',
                },
                headers: {},
                socket: {},
            },
            {
                status() {
                    return this;
                },
                json() {
                    return this;
                },
            },
            (error) => {
                nextError = error;
            }
        );

        assert.equal(nextError?.status, 400);
        assert.match(nextError?.message || '', /verification code is required/i);
        assert.equal(user.oauthIdentities.length, 2);
    } finally {
        User.findById = originalFindById;
    }
});

test('unlink with email or SMS 2FA verifies the sent provider-bound code', async () => {
    const originalFindById = User.findById;

    try {
        for (const method of ['email', 'sms']) {
            const user = {
                _id: 'user-123',
                email: 'user@example.com',
                passwordHash: await bcrypt.hash('valid-current-password', 4),
                authProviders: ['google', 'facebook'],
                oauthIdentities: [
                    { provider: 'google', providerUserId: 'google-123' },
                    { provider: 'facebook', providerUserId: 'facebook-123' },
                ],
                twoFactor: { enabled: true, methods: [method] },
                socialAccountOtpHash: await bcrypt.hash('123456', 4),
                socialAccountOtpExpiresAt: new Date(Date.now() + 60_000),
                socialAccountOtpProvider: 'google',
                socialAccountOtpMethod: method,
                passkeys: [],
                securityEvents: [],
                async save() {},
            };

            User.findById = () => ({
                select: async () => user,
            });

            let responseBody;
            let nextError;
            await unlinkSocialAccount(
                {
                    user: { id: user._id },
                    params: { provider: 'google' },
                    body: {
                        currentPassword: 'valid-current-password',
                        method,
                        code: '123456',
                    },
                    headers: {},
                    socket: {},
                },
                {
                    status() {
                        return this;
                    },
                    json(body) {
                        responseBody = body;
                        return this;
                    },
                },
                (error) => {
                    nextError = error;
                }
            );

            assert.ifError(nextError);
            assert.equal(responseBody.message, 'google account disconnected successfully.');
            assert.equal(user.oauthIdentities.length, 1);
        }
    } finally {
        User.findById = originalFindById;
    }
});
