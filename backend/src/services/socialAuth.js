const crypto = require('crypto');
const User = require('../models/user');

const { generateTokens, setCookies, getCustomerRoleId, googleClient, } = require('../middleware/auth');
const { issueEmailOtp, issueSmsOtp, } = require('../utils/mfaOtp');
const { issueTrustedDevice, findTrustedDeviceEntry, } = require('../utils/deviceTrust');
const { addSecurityEvent, buildSessionMeta, } = require('../utils/securityEvents');
const { notifyLoginAlert, } = require('../utils/loginAlerts');
const { createNotification, } = require('../utils/notifications');
const { oauthError, } = require('../utils/oAuthHelpers');

const SUPPORTED_PROVIDERS = ['google', 'facebook', 'github'];

const DAY_MS = 24 * 60 * 60 * 1000;

function createSocialError(status, message, publicCode) {
    const error = new Error(message);
    error.status = status;

    if (publicCode) {
        error.publicCode = publicCode;
    }

    return error;
}

function normalizeEmail(email) {
    return typeof email === 'string' ? email.trim().toLowerCase() : null;
}

function assertSupportedProvider(provider) {
    if (!SUPPORTED_PROVIDERS.includes(provider)) throw createSocialError(400, 'Unsupported social provider.');
}

function assertActiveUser(user) {
    if (!user) throw createSocialError(404, 'User not found.');

    if (user.isActive === false) {
        throw createSocialError(
            403,
            'This account has been deactivated.',
            'account_deactivated'
        );
    }

    return user;
}

function getProviderIdentity(user, provider) {
    return (user.oauthIdentities || []).find((identity) => identity.provider === provider) || null;
}

function getLinkedProviders(user) {
    const providers = new Set();

    for (const identity of user.oauthIdentities || []) {
        if (SUPPORTED_PROVIDERS.includes(identity.provider)) providers.add(identity.provider);
    }

    for (const provider of user.authProviders || []) {
        if (SUPPORTED_PROVIDERS.includes(provider)) { providers.add(provider); }
    }

    return [...providers];
}

function getSocialAccountSummary(user) {
    return {
        linkedProviders: getLinkedProviders(user),
        hasPassword: Boolean(user.passwordHash),
        hasPasskeys: Boolean(user.passkeys?.length),
        twoFactor: {
            enabled: Boolean(user.twoFactor?.enabled),
            methods: user.twoFactor?.methods || [],
        },
    };
}

async function verifyGoogleCredential(credential) {
    if (typeof credential !== 'string' || !credential.trim()) throw createSocialError(400, 'Google credential is required.');

    if (!process.env.GOOGLE_CLIENT_ID) throw createSocialError(500, 'Google OAuth is not configured.');

    try {
        const ticket = await googleClient.verifyIdToken({
            idToken: credential,
            audience: process.env.GOOGLE_CLIENT_ID,
        });

        const payload = ticket.getPayload();

        if (!payload?.sub || !payload?.email || payload.email_verified !== true) throw createSocialError(401, 'Google account could not be verified.');

        return {
            provider: 'google',
            providerUserId: String(payload.sub),
            email: normalizeEmail(payload.email),
            emailVerified: true,
            name:
                payload.name ||
                payload.given_name ||
                payload.email.split('@')[0],
            avatar: payload.picture || null,
            login: null,
        };
    } catch (err) {
        if (err.status) throw err;

        throw createSocialError(401, 'Google credential is invalid or expired.');
    }
}

async function verifyFacebookAccessToken(accessToken) {
    if (typeof accessToken !== 'string' || !accessToken.trim()) throw createSocialError(400, 'Facebook access token is required.');

    const appId = process.env.FACEBOOK_APP_ID;
    const appSecret = process.env.FACEBOOK_APP_SECRET;

    if (!appId || !appSecret) throw createSocialError(500, 'Facebook OAuth is not configured.');

    try {
        const debugUrl = new URL('https://graph.facebook.com/debug_token');

        debugUrl.searchParams.set('input_token', accessToken);
        debugUrl.searchParams.set(
            'access_token',
            `${appId}|${appSecret}`
        );

        const debugResponse = await fetch(debugUrl, { signal: AbortSignal.timeout(8000), });

        const debugBody = await debugResponse.json().catch(() => ({}));
        const tokenData = debugBody?.data;

        if (!debugResponse.ok || !tokenData?.is_valid || String(tokenData.app_id) !== String(appId)) { throw createSocialError(401, 'Facebook access token is invalid or belongs to another application.'); }

        if (tokenData.expires_at && Number(tokenData.expires_at) > 0 && Number(tokenData.expires_at) * 1000 <= Date.now()) {
            throw createSocialError(401, 'Facebook access token has expired.');
        }

        const profileUrl = new URL('https://graph.facebook.com/me');

        profileUrl.searchParams.set(
            'fields',
            'id,name,email,picture'
        );

        const profileResponse = await fetch(profileUrl, {
            headers: { Authorization: `Bearer ${accessToken}`, },
            signal: AbortSignal.timeout(8000),
        });

        const profile = await profileResponse.json().catch(() => ({}));

        if (!profileResponse.ok || !profile.id || String(profile.id) !== String(tokenData.user_id)) {
            throw createSocialError(401, 'Facebook account could not be verified.');
        }

        return {
            provider: 'facebook',
            providerUserId: String(profile.id),
            email: normalizeEmail(profile.email),
            emailVerified: Boolean(profile.email),
            name: profile.name || null,
            avatar: profile.picture?.data?.url || null,
            login: null,
        };
    } catch (err) {
        if (err.status) throw err;

        throw createSocialError(401, 'Facebook access token is invalid, expired, or could not be verified.');
    }
}

async function verifyProviderCredential(provider, body = {}) {
    assertSupportedProvider(provider);

    if (provider === 'google') return verifyGoogleCredential(body.credential);

    if (provider === 'facebook') return verifyFacebookAccessToken(body.accessToken);

    throw createSocialError(400, 'GitHub account verification must use the GitHub OAuth callback.');
}

async function findProviderOwner(provider, providerUserId) {
    return User.findOne({
        oauthIdentities: {
            $elemMatch: {
                provider,
                providerUserId: String(providerUserId),
            },
        },
    });
}

async function linkProviderIdentity(userId, identity, req) {
    assertSupportedProvider(identity?.provider);

    if (!identity?.providerUserId) throw createSocialError(400, 'The provider did not return a valid account identifier.');

    const user = await User.findById(userId);

    assertActiveUser(user);

    const provider = identity.provider;
    const providerUserId = String(identity.providerUserId);

    const currentIdentity = getProviderIdentity(user, provider);

    if (currentIdentity) {
        if (currentIdentity.providerUserId === providerUserId) throw createSocialError(409, `${provider} is already connected to this account.`);

        throw createSocialError(409, `Another ${provider} account is already connected. Unlink it before connecting a different one.`);
    }

    const owner = await findProviderOwner(provider, providerUserId);

    if (owner && String(owner._id) !== String(user._id)) throw createSocialError(409, 'This social account is already connected to another GoldCinema account.');

    const legacyProviderMarker = (user.authProviders || []).includes(provider);

    if (legacyProviderMarker) {
        const providerEmail = normalizeEmail(identity.email);

        if (!providerEmail || providerEmail !== normalizeEmail(user.email)) {
            throw createSocialError(409, `A legacy ${provider} connection exists, but its identity cannot be safely matched. The verified provider email must match this GoldCinema account's email.`);
        }
    }

    user.oauthIdentities.push({
        provider,
        providerUserId,
        login: identity.login || null,
        email: normalizeEmail(identity.email),
        name: identity.name || null,
        avatar: identity.avatar || null,
        linkedAt: new Date(),
    });

    if (!user.authProviders.includes(provider)) user.authProviders.push(provider);

    await addSecurityEvent(user, {
        type: 'social_account_linked',
        title: `${provider} Account Linked`,
        description:
            `Provider: ${provider}; IP: ${req?.headers?.['x-forwarded-for']?.split(',')[0]?.trim() ||
            req?.socket?.remoteAddress ||
            req?.ip ||
            'Unknown'
            }`,
    });

    try {
        await user.save();
    } catch (err) {
        if (err.code === 11000) throw createSocialError(409, 'This social account is already connected to another GoldCinema account.');

        throw err;
    }

    createNotification({
        userId: user._id,
        title: 'Social Account Connected',
        message: `Your ${provider} account was connected to your GoldCinema account.`,
        type: 'security',
        link: '/account/profile',
        metadata: {
            provider,
            action: 'linked',
            time: new Date().toISOString(),
        },
    });

    return getSocialAccountSummary(user);
}

function assertCanUnlinkProvider(user, provider) {
    assertSupportedProvider(provider);

    if (!user.passwordHash) {
        throw createSocialError(
            409,
            'Create a password before disconnecting a social account.',
            'password_required'
        );
    }

    const linkedProviders = getLinkedProviders(user);

    const remainingProviders = linkedProviders.filter((item) => item !== provider);

    const hasPassword = Boolean(user.passwordHash);
    const hasPasskey = Boolean(user.passkeys?.length);

    const remainingLoginMethods = Number(hasPassword) + Number(hasPasskey) + Number(remainingProviders.length);

    if (remainingLoginMethods < 1) throw createSocialError(409, 'This is your only sign-in method. Add a password or connect another sign-in method before unlinking it.');
}

async function unlinkProviderIdentity(user, provider, req, identityProof = null) {
    assertSupportedProvider(provider);
    assertActiveUser(user);

    const currentIdentity = getProviderIdentity(user, provider);
    const hasLegacyMarker = (user.authProviders || []).includes(provider);

    if (!currentIdentity && !hasLegacyMarker) throw createSocialError(404, `${provider} is not connected to this GoldCinema account.`);

    if (currentIdentity && identityProof) {
        if (String(currentIdentity.providerUserId) !== String(identityProof.providerUserId)) throw createSocialError(401, 'The verified social account does not match the connected account.');
    }

    if (!currentIdentity && identityProof) {
        const verifiedEmail = normalizeEmail(identityProof.email);

        if (!verifiedEmail || verifiedEmail !== normalizeEmail(user.email)) throw createSocialError(401, 'The verified social account does not match this GoldCinema account.');
    }

    user.oauthIdentities = (user.oauthIdentities || []).filter((identity) => identity.provider !== provider);

    user.authProviders = (user.authProviders || []).filter((item) => item !== provider);

    user.socialAccountOtpHash = null;
    user.socialAccountOtpExpiresAt = null;
    user.socialAccountOtpProvider = null;
    user.socialAccountOtpMethod = null;
    user.socialAccountOtpSentAt = null;

    await addSecurityEvent(user, {
        type: 'social_account_unlinked',
        title: `${provider} Account Unlinked`,
        description:
            `Provider: ${provider}; IP: ${req?.headers?.['x-forwarded-for']?.split(',')[0]?.trim() ||
            req?.socket?.remoteAddress ||
            req?.ip ||
            'Unknown'
            }`,
    });

    await user.save();

    createNotification({
        userId: user._id,
        title: 'Social Account Disconnected',
        message: `Your ${provider} account was disconnected from GoldCinema.`,
        type: 'security',
        link: '/account/profile',
        metadata: {
            provider,
            action: 'unlinked',
            time: new Date().toISOString(),
        },
    });

    return getSocialAccountSummary(user);
}

async function findOrCreateOAuthUser(identity, req) {
    const provider = identity?.provider;
    const providerUserId = identity?.providerUserId;
    const email = normalizeEmail(identity?.email);

    assertSupportedProvider(provider);

    if (!providerUserId || !email) throw oauthError('social_identity_incomplete', 'The social provider did not return the required account information.');


    let user = await User.findOne({
        oauthIdentities: {
            $elemMatch: {
                provider,
                providerUserId: String(providerUserId),
            },
        },
    }).populate('role');

    if (user) {
        assertActiveUser(user);
        const linkedGoogleIdentity = user.oauthIdentities?.find((entry) => entry.provider === 'google' && entry.providerUserId === String(providerUserId));

        if (provider === 'google' && linkedGoogleIdentity?.avatar && user.avatar === linkedGoogleIdentity.avatar) {
            user.avatar = null;
            await user.save();
        }

        return user;
    }

    user = await User.findOne({ email }).populate('role');

    if (user) {
        assertActiveUser(user);

        if (identity.emailVerified !== true) throw oauthError('account_exists', 'An account with this email already exists. Sign in using your existing method and connect this provider from GoldCinema profile settings.');

        const existingIdentity = getProviderIdentity(user, provider);
        if (existingIdentity && existingIdentity.providerUserId !== String(providerUserId)) throw oauthError('provider_already_linked', `A different ${provider} account is already connected to this GoldCinema account.`);

        if (!existingIdentity) {
            await linkProviderIdentity(user._id, identity, req);
            user = await User.findById(user._id).populate('role');
        }

        if (!user.emailVerified) {
            user.emailVerified = true;
            await user.save();
        }

        return User.findById(user._id).populate('role');
    }

    const roleId = await getCustomerRoleId();

    try {
        const createdUser = await User.create({
            name: identity.name || email.split('@')[0],
            email,
            passwordHash: null,
            role: roleId,
            emailVerified: true,
            authProviders: [provider],
            oauthIdentities: [
                {
                    provider,
                    providerUserId: String(providerUserId),
                    login: identity.login || null,
                    email,
                    name: identity.name || null,
                    avatar: identity.avatar || null,
                    linkedAt: new Date(),
                },
            ],
            avatar: provider === 'google' ? null : identity.avatar || null,
        });

        return User.findById(createdUser._id).populate('role');
    } catch (err) {
        if (err.code === 11000) {
            const identityOwner = await User.findOne({
                oauthIdentities: {
                    $elemMatch: {
                        provider,
                        providerUserId: String(providerUserId),
                    },
                },
            }).populate('role');

            if (identityOwner) return assertActiveUser(identityOwner);

            throw oauthError('account_exists', 'An account with this email already exists. Sign in using your existing method and connect this provider from Profile Settings.');
        }

        throw err;
    }
}

async function completeSocialLogin({ req, res, user, provider }) {
    assertActiveUser(user);

    const trustedEntry = findTrustedDeviceEntry(user, req);

    if (trustedEntry) trustedEntry.lastUsedAt = new Date();

    if (!trustedEntry && user.twoFactor?.enabled && user.twoFactor.methods?.length > 0) {
        const mfaToken = require('../utils/tokens').generateMfaPendingToken(user._id);

        const methods = user.twoFactor.methods;

        if (methods.includes('email')) await issueEmailOtp(user);

        if (methods.includes('sms')) await issueSmsOtp(user, { save: false });


        await addSecurityEvent(user, {
            type: 'social_login_mfa_pending',
            title: `${provider} Login Requires Verification`,
            description:
                `Provider: ${provider}; IP: ${req.headers['x-forwarded-for'] ||
                req.socket?.remoteAddress ||
                'Unknown'
                }`,
        });

        await user.save();

        return {
            mfaRequired: true,
            mfaToken,
            methods,
        };
    }

    const refreshExpiresIn = '7d';
    const refreshMaxAgeMs = 7 * DAY_MS;
    const sessionId = crypto.randomUUID();

    const { accessToken, refreshToken } = generateTokens(
        user._id,
        sessionId,
        refreshExpiresIn
    );

    user.refreshTokens.push({
        token: refreshToken,
        expiresAt: new Date(Date.now() + refreshMaxAgeMs),
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

    await addSecurityEvent(user, {
        type: 'login_oauth',
        title: `Logged in with ${provider}`,
        description:
            `IP: ${req.headers['x-forwarded-for'] ||
            req.socket?.remoteAddress ||
            'Unknown'
            }`,
    });

    await user.save();

    setCookies(
        res,
        accessToken,
        refreshToken,
        refreshMaxAgeMs
    );

    notifyLoginAlert(user, req, provider);

    createNotification({
        userId: user._id,
        title: `${provider} Login Detected`,
        message: `You logged in to GoldCinema via ${provider} authentication.`,
        type: 'login',
        link: '/account/security',
        metadata: {
            method: provider,
            time: new Date().toISOString(),
        },
    });

    return { user };
}

module.exports = {
    verifyGoogleCredential,
    verifyFacebookAccessToken,
    verifyProviderCredential,
    getLinkedProviders,
    getSocialAccountSummary,
    linkProviderIdentity,
    unlinkProviderIdentity,
    assertCanUnlinkProvider,
    findOrCreateOAuthUser,
    completeSocialLogin,
};