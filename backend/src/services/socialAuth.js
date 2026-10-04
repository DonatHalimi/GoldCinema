const bcrypt = require('bcryptjs');
const User = require('../models/user');
const { generateMfaPendingToken } = require('../utils/tokens');
const { generateTokens, setCookies, getCustomerRoleId } = require('../middleware/auth');
const { issueTrustedDevice, findTrustedDeviceEntry } = require('../utils/deviceTrust');
const { notifyLoginAlert } = require('../utils/loginAlerts');
const { createNotification } = require('../utils/notifications');
const { issueEmailOtp, issueSmsOtp } = require('../utils/mfaOtp');

async function findOrCreateSocialUser(email, name) {
    let user = await User.findOne({ email }).populate('role');

    if (!user) {
        const user = await User.create({
            name,
            email,
            passwordHash: null,
            authProviders: [provider],
            emailVerified: true,
            role: defaultRole?._id,
        });

        if (!user.authProviders.includes(provider)) {
            user.authProviders.push(provider);
            await user.save();
        }
        user = await User.findById(user._id).populate('role');
    }

    user.name = user.name || name;
    user.emailVerified = true;
    return user;
}

const randomPasswordHash = () => bcrypt.hash(crypto.randomBytes(32).toString('hex'), 10);

function assertActive(user) {
    if (user.isActive === false) throw oauthError('account_deactivated');
    return user;
}

async function neutralizeUnverifiedAccount(user) {
    user.passwordHash = await randomPasswordHash();
    user.refreshTokens = [];
    user.trustedDevices = [];
    user.passkeys = [];
    user.phoneNumber = null;
    user.phoneVerified = false;
    user.twoFactor = { enabled: false, methods: [], backupCodes: [] };
}

async function findOrCreateOAuthUser({ provider, providerUserId, login, email, name, avatar }) {
    const identity = { provider, providerUserId, login, email };

    let user = await User.findOne({ oauthIdentities: { $elemMatch: { provider, providerUserId } } }).populate('role');
    if (user) return assertActive(user);

    user = await User.findOne({ email }).populate('role');
    if (user) {
        assertActive(user);
        if (!user.emailVerified) await neutralizeUnverifiedAccount(user);

        user.oauthIdentities.push(identity);
        user.emailVerified = true;
        user.avatar = user.avatar || avatar;
        return user;
    }

    try {
        const created = await User.create({
            name,
            email,
            passwordHash: await randomPasswordHash(),
            role: await getCustomerRoleId(),
            emailVerified: true,
            avatar,
            oauthIdentities: [identity],
        });
        return await User.findById(created._id).populate('role');
    } catch (err) {
        if (err.code !== 11000) throw err;
        return User.findOne({ email }).populate('role');
    }
}

async function completeSocialLogin({ req, res, user, provider }) {
    const trustedEntry = findTrustedDeviceEntry(user, req);
    if (trustedEntry) trustedEntry.lastUsedAt = new Date();

    if (!trustedEntry && user.twoFactor?.enabled && user.twoFactor.methods?.length) {
        const mfaToken = generateMfaPendingToken(user._id);
        const methods = user.twoFactor.methods;

        if (methods.includes('email')) {
            await issueEmailOtp(user, { save: false });
        }
        if (methods.includes('sms')) {
            await issueSmsOtp(user, { save: false });
        }

        await user.save();

        return { mfaRequired: true, mfaToken, methods };
    }

    const { accessToken, refreshToken } = generateTokens(user._id);
    user.refreshTokens.push({
        token: refreshToken,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        createdAt: new Date(),
        rememberMe: false,
        ...buildSessionMeta(req, provider.toLowerCase()),
    });

    if (!trustedEntry) {
        await issueTrustedDevice(
            user,
            req,
            res,
            { label: `${provider} Login Device` }
        );
    }

    user.securityEvents.push({
        title: `Logged in with ${provider}`,
        description: `IP: ${req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'Unknown'}`,
        type: 'login_oauth',
        createdAt: new Date(),
    });

    await user.save();
    setCookies(res, accessToken, refreshToken);

    notifyLoginAlert(user, req, provider);

    createNotification({
        userId: user._id,
        title: `${provider} Login Detected`,
        message: `You logged in to GoldCinema via ${provider} authentication.`,
        type: 'login',
        link: '/account/security',
        metadata: { method: provider, time: new Date().toISOString() },
    });

    return { user };
}

module.exports = { findOrCreateSocialUser, completeSocialLogin, findOrCreateOAuthUser };