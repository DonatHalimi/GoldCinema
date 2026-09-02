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
        const roleId = await getCustomerRoleId();
        const passwordHash = await bcrypt.hash(
            `${Date.now()}-social-${Math.random().toString(36).slice(2)}`,
            10
        );
        user = await User.create({ name, email, passwordHash, role: roleId, emailVerified: true });
        user = await User.findById(user._id).populate('role');
    }

    user.name = user.name || name;
    user.emailVerified = true;
    return user;
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

module.exports = { findOrCreateSocialUser, completeSocialLogin };