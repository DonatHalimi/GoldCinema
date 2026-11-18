const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const { authenticator } = require('@otplib/preset-default');
const User = require('../models/user');
const {
    verifyGoogleCredential,
    verifyFacebookAccessToken,
    verifyProviderCredential,
    findOrCreateOAuthUser,
    completeSocialLogin,
    getSocialAccountSummary,
    getLinkedProviders,
    assertCanUnlinkProvider,
    linkProviderIdentity,
    unlinkProviderIdentity,
} = require('../services/socialAuth');
const { sendTwoFactorCode, } = require('../utils/mailer');
const { sendSms, } = require('../utils/smsClient');

function getUserId(req) {
    return req.user?._id || req.user?.id;
}

function normalizeProvider(provider) {
    return typeof provider === 'string'
        ? provider.toLowerCase()
        : '';
}

function validateProvider(provider, res, allowed = ['google', 'facebook', 'github']) {
    if (!allowed.includes(provider)) {
        res.status(400).json({
            error: 'Unsupported social provider.',
        });

        return false;
    }

    return true;
}

function getClientUser(user) {
    return {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role?.name || user.role || 'user',
    };
}

async function googleLogin(req, res, next) {
    try {
        const identity = await verifyGoogleCredential(req.body?.credential);

        const user = await findOrCreateOAuthUser(identity, req);

        const result = await completeSocialLogin({
            req,
            res,
            user,
            provider: 'Google',
        });

        if (result.mfaRequired) return res.json({ message: 'Two-factor authentication required.', ...result, });

        return res.json({
            message: 'Logged in with Google successfully.',
            user: getClientUser(result.user),
        });
    } catch (err) {
        next(err);
    }
}

async function facebookLogin(req, res, next) {
    try {
        const identity = await verifyFacebookAccessToken(req.body?.accessToken);

        if (!identity.email) return res.status(400).json({ error: 'Facebook must provide an email address to create or locate a GoldCinema account.', });

        const user = await findOrCreateOAuthUser(identity, req);

        const result = await completeSocialLogin({
            req,
            res,
            user,
            provider: 'Facebook',
        });

        if (result.mfaRequired) return res.json({ message: 'Two-factor authentication required.', ...result, });

        return res.json({
            message: 'Logged in with Facebook successfully.',
            user: getClientUser(result.user),
        });
    } catch (err) {
        next(err);
    }
}

async function getSocialAccounts(req, res, next) {
    try {
        const user = await User.findById(getUserId(req)).select('+passwordHash');

        if (!user) return res.status(404).json({ error: 'User not found.', });

        const summary = getSocialAccountSummary(user);

        return res.json({ ...summary, });
    } catch (err) {
        next(err);
    }
}

async function linkSocialAccount(req, res, next) {
    try {
        const provider = normalizeProvider(req.params.provider);

        if (!validateProvider(provider, res, ['google', 'facebook'])) return;

        let identity;

        if (provider === 'google') {
            identity = await verifyGoogleCredential(req.body?.credential);
        } else {
            identity = await verifyFacebookAccessToken(req.body?.accessToken);
        }

        const summary = await linkProviderIdentity(
            getUserId(req),
            identity,
            req
        );

        return res.json({
            message: `${provider} account connected successfully.`,
            ...summary,
        });
    } catch (err) {
        next(err);
    }
}

async function sendUnlinkVerificationCode(req, res, next) {
    try {
        const provider = normalizeProvider(req.params.provider);
        const method = req.body?.method;

        if (!validateProvider(provider, res)) return;


        if (!['email', 'sms'].includes(method)) return res.status(400).json({ error: 'Select email or SMS verification.', });

        const user = await User.findById(getUserId(req)).select('+passwordHash');

        if (!user) return res.status(404).json({ error: 'User not found.', });
        if (!user.passwordHash) {
            return res.status(409).json({
                error: 'Create a password before requesting unlink verification.',
                code: 'password_required',
            });
        }

        if (!req.body?.currentPassword) return res.status(400).json({ error: 'Your current password is required.' });

        const passwordValid = await bcrypt.compare(
            req.body.currentPassword,
            user.passwordHash
        );

        if (!passwordValid) return res.status(401).json({ error: 'Incorrect current password.' });

        if (!getLinkedProviders(user).includes(provider)) return res.status(404).json({ error: `${provider} is not connected to this account.`, });

        if (!user.twoFactor?.enabled || !user.twoFactor.methods?.includes(method)) return res.status(400).json({ error: `The ${method} verification method is not enabled on this account.`, });

        const now = Date.now();
        const lastSentAt = user.socialAccountOtpSentAt ? new Date(user.socialAccountOtpSentAt).getTime() : 0;

        if (lastSentAt && now - lastSentAt < 30 * 1000) return res.status(429).json({ error: 'Please wait 30 seconds before requesting another verification code.', });

        if (method === 'sms' && (!user.phoneNumber || !user.phoneVerified)) return res.status(400).json({ error: 'A verified phone number is required for SMS verification.', });

        const code = crypto.randomInt(100000, 1000000).toString();

        user.socialAccountOtpHash = await bcrypt.hash(code, 10);
        user.socialAccountOtpExpiresAt = new Date(now + 5 * 60 * 1000);
        user.socialAccountOtpProvider = provider;
        user.socialAccountOtpMethod = method;
        user.socialAccountOtpSentAt = new Date(now);

        await user.save();

        if (method === 'email') {
            await sendTwoFactorCode({
                to: user.email,
                name: user.name,
                code,
            });
        } else {
            await sendSms(user.phoneNumber, `Your GoldCinema account-unlink verification code is ${code}. It expires in 5 minutes.`);
        }

        return res.json({
            message:
                method === 'email'
                    ? 'A verification code was sent to your email.'
                    : 'A verification code was sent to your phone.',
            expiresIn: 300,
        });
    } catch (err) {
        next(err);
    }
}

async function verifyUnlinkTwoFactor(user, provider, method, code) {
    if (!user.twoFactor?.enabled) return;

    const normalizedCode = String(code || '').trim();
    if (!method || !user.twoFactor.methods?.includes(method)) throw Object.assign(new Error('Select an enabled two-factor method.'), { status: 400 });

    if (!normalizedCode) throw Object.assign(new Error('A two-factor verification code is required.'), { status: 400 });

    let valid = false;
    if (method === 'totp') {
        valid = Boolean(user.twoFactor.totpSecret && authenticator.check(normalizedCode, user.twoFactor.totpSecret));
    } else if (method === 'email' || method === 'sms') {
        valid = Boolean(
            user.socialAccountOtpProvider === provider &&
            user.socialAccountOtpMethod === method &&
            user.socialAccountOtpHash &&
            user.socialAccountOtpExpiresAt > new Date() &&
            await bcrypt.compare(normalizedCode, user.socialAccountOtpHash)
        );
    }

    if (!valid) throw Object.assign(new Error('The two-factor verification code is invalid or expired.'), { status: 401 });
}

async function unlinkSocialAccount(req, res, next) {
    try {
        const provider = normalizeProvider(req.params.provider);

        if (!validateProvider(provider, res)) return;

        const user = await User.findById(getUserId(req))
            .select(
                '+passwordHash ' +
                '+socialAccountOtpHash ' +
                '+socialAccountOtpExpiresAt ' +
                '+socialAccountOtpProvider ' +
                '+socialAccountOtpMethod ' +
                '+twoFactor.totpSecret'
            );

        if (!user) return res.status(404).json({ error: 'User not found.', });

        assertCanUnlinkProvider(user, provider);

        if (user.passwordHash) {
            const currentPassword = req.body?.currentPassword;

            if (!currentPassword) return res.status(400).json({ error: 'Your current password is required to unlink a social account.', });

            const passwordValid = await bcrypt.compare(
                currentPassword,
                user.passwordHash
            );

            if (!passwordValid) return res.status(401).json({ error: 'Incorrect current password.', });
        }

        await verifyUnlinkTwoFactor(
            user,
            provider,
            req.body?.method,
            req.body?.code
        );

        let identityProof = null;

        if (!user.passwordHash) {
            if (provider === 'github') {
                return res.status(400).json({
                    error: 'GitHub unlinking requires the GitHub re-authentication flow.',
                    code: 'GITHUB_REAUTH_REQUIRED',
                });
            }

            identityProof = await verifyProviderCredential(provider, req.body || {});

            const existingIdentity = (user.oauthIdentities || []).find((identity) => identity.provider === provider);

            if (existingIdentity) {
                if (String(existingIdentity.providerUserId) !== String(identityProof.providerUserId)) return res.status(401).json({ error: 'The verified social account does not match the connected account.', });
            } else if (!identityProof.email || identityProof.email.toLowerCase() !== user.email.toLowerCase()) {
                return res.status(401).json({ error: 'The verified social account does not match this GoldCinema account.', });
            }
        }

        const summary = await unlinkProviderIdentity(
            user,
            provider,
            req,
            identityProof
        );

        return res.json({
            message: `${provider} account disconnected successfully.`,
            ...summary,
        });
    } catch (err) {
        next(err);
    }
}

module.exports = {
    googleLogin,
    facebookLogin,
    getSocialAccounts,
    linkSocialAccount,
    sendUnlinkVerificationCode,
    unlinkSocialAccount,
};