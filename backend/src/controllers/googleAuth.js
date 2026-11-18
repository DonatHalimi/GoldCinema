const crypto = require('crypto');
const { OAuth2Client } = require('google-auth-library');
const User = require('../models/user');
const {
    verifyGoogleCredential,
    linkProviderIdentity,
    unlinkProviderIdentity,
    assertCanUnlinkProvider,
    getLinkedProviders,
} = require('../services/socialAuth');
const { safeEqual } = require('../utils/oAuthHelpers');

const STATE_COOKIE = 'google_oauth';
const STATE_COOKIE_PATH = '/api/auth/google';
const STATE_TTL_MS = 10 * 60 * 1000;
const hashToken = (token) => crypto.createHash('sha256').update(token).digest('base64url');

const clientUrl = () => (process.env.CLIENT_URL || 'http://localhost:3000').replace(/\/$/, '');

function getOAuthConfig() {
    const { GOOGLE_CLIENT_ID: clientId, GOOGLE_CLIENT_SECRET: clientSecret, GOOGLE_CALLBACK_URL: callbackUrl } = process.env;

    if (!clientId || !clientSecret || !callbackUrl) {
        throw Object.assign(
            new Error('Google account linking requires GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, and GOOGLE_CALLBACK_URL.'),
            { code: 'google_configuration_missing' }
        );
    }

    return { clientId, clientSecret, callbackUrl };
}

function createOAuthClient() {
    const { clientId, clientSecret, callbackUrl } = getOAuthConfig();
    return new OAuth2Client(clientId, clientSecret, callbackUrl);
}

function cookieOptions() {
    return {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: STATE_COOKIE_PATH,
    };
}

function readStateCookie(req) {
    try {
        const value = JSON.parse(req.cookies?.[STATE_COOKIE]);
        return value?.state ? value : null;
    } catch {
        return null;
    }
}

function signStateData(stateData) {
    if (!process.env.JWT_SECRET) throw new Error('JWT_SECRET is not configured.');

    return crypto
        .createHmac('sha256', process.env.JWT_SECRET)
        .update(JSON.stringify(stateData))
        .digest('base64url');
}

function verifyStateSignature(saved) {
    if (!saved?.signature) return false;
    const { signature, ...stateData } = saved;

    try {
        return safeEqual(signature, signStateData(stateData));
    } catch {
        return false;
    }
}

function clearStateCookie(res) {
    res.clearCookie(STATE_COOKIE, cookieOptions());
}

function socialFailure(res, code) {
    return res.redirect(`${clientUrl()}/account/profile?socialError=${encodeURIComponent(code)}`);
}

function socialSuccess(res, action) {
    return res.redirect(`${clientUrl()}/account/profile?socialAction=${encodeURIComponent(action)}&provider=google`);
}

function beginGoogleFlow(req, res, intent) {
    try {
        const refreshToken = req.cookies?.refreshToken;
        const userId = String(req.user?._id || req.user?.id || '');
        if (!userId || !refreshToken) return socialFailure(res, 'session_changed');

        const stateData = {
            state: crypto.randomBytes(32).toString('base64url'),
            intent,
            userId,
            refreshTokenHash: hashToken(refreshToken),
            createdAt: Date.now(),
        };

        const signedState = {
            ...stateData,
            signature: signStateData(stateData),
        };

        res.cookie(STATE_COOKIE, JSON.stringify(signedState), {
            ...cookieOptions(),
            maxAge: STATE_TTL_MS,
        });

        const authorizeUrl = createOAuthClient().generateAuthUrl({
            access_type: 'online',
            prompt: 'select_account',
            scope: ['openid', 'email', 'profile'],
            state: stateData.state,
        });

        return res.redirect(authorizeUrl);
    } catch (error) {
        console.error('[google-oauth] start failed:', error.message);
        return socialFailure(res, error.code || 'google_failed');
    }
}

function googleLinkStart(req, res) {
    return beginGoogleFlow(req, res, 'link');
}

async function googleUnlinkStart(req, res) {
    try {
        const user = await User.findById(req.user?._id || req.user?.id).select('+passwordHash');

        if (!user) return socialFailure(res, 'user_not_found');

        const hasOtherLinkedProvider = getLinkedProviders(user).some(
            (provider) => provider !== 'google'
        );

        if (user.passwordHash || (!hasOtherLinkedProvider && !user.passkeys?.length)) {
            return socialFailure(res, 'google_unlink_requires_confirmation');
        }

        assertCanUnlinkProvider(user, 'google');
        return beginGoogleFlow(req, res, 'unlink');
    } catch (error) {
        if (error.publicCode === 'password_required') {
            return socialFailure(res, 'password_required');
        }
        if (error.status === 409) return socialFailure(res, 'last_login_method');
        console.error('[google-oauth] unlink start failed:', error.message);
        return socialFailure(res, 'google_failed');
    }
}

async function googleCallbackAuth(req, res, next) {
    const saved = readStateCookie(req);

    if (
        !saved ||
        !['link', 'unlink'].includes(saved.intent) ||
        !verifyStateSignature(saved) ||
        !saved.userId ||
        !saved.refreshTokenHash ||
        !saved.createdAt ||
        Date.now() - Number(saved.createdAt) > STATE_TTL_MS
    ) {
        return socialFailure(res, 'invalid_state');
    }

    try {
        const user = await User.findById(saved.userId).select('+passwordHash');
        if (!user || user.isActive === false) return socialFailure(res, 'session_changed');

        const activeSession = (user.refreshTokens || []).some(
            (session) =>
                session.token &&
                hashToken(session.token) === saved.refreshTokenHash &&
                session.expiresAt > new Date() &&
                !session.revokedAt
        );

        if (!activeSession || (user.tokensInvalidatedAt && user.tokensInvalidatedAt.getTime() > Number(saved.createdAt))) {
            return socialFailure(res, 'session_changed');
        }

        req.user = user;
        return next();
    } catch (error) {
        console.error('[google-oauth] callback session validation failed:', error.message);
        return socialFailure(res, 'session_changed');
    }
}

async function googleCallback(req, res) {
    const saved = readStateCookie(req);
    clearStateCookie(res);

    try {
        const { code, state, error } = req.query;

        if (error) return socialFailure(res, error === 'access_denied' ? 'google_denied' : 'google_failed');

        if (
            !saved ||
            !verifyStateSignature(saved) ||
            typeof code !== 'string' ||
            !safeEqual(saved.state, state)
        ) {
            return socialFailure(res, 'invalid_state');
        }

        const client = createOAuthClient();
        const { tokens } = await client.getToken(code);
        if (!tokens.id_token) return socialFailure(res, 'social_verification_failed');

        const identity = await verifyGoogleCredential(tokens.id_token);
        if (String(req.user?._id || req.user?.id) !== String(saved.userId)) return socialFailure(res, 'session_changed');

        if (saved.intent === 'link') {
            await linkProviderIdentity(saved.userId, identity, req);
            return socialSuccess(res, 'linked');
        }

        const user = await User.findById(saved.userId).select('+passwordHash');
        if (!user) return socialFailure(res, 'user_not_found');
        const hasOtherLinkedProvider = getLinkedProviders(user).some((provider) => provider !== 'google');

        if (user.passwordHash || (!hasOtherLinkedProvider && !user.passkeys?.length)) return socialFailure(res, 'google_unlink_requires_confirmation');

        assertCanUnlinkProvider(user, 'google');
        await unlinkProviderIdentity(user, 'google', req, identity);
        return socialSuccess(res, 'unlinked');
    } catch (error) {
        console.error('[google-oauth] callback failed:', error.publicCode || error.message);

        if (error.status === 409) {
            return socialFailure(
                res,
                error.publicCode === 'password_required'
                    ? 'password_required'
                    : error.message?.toLowerCase().includes('only sign-in method')
                        ? 'last_login_method'
                        : 'social_action_conflict'
            );
        }

        if (error.status === 401 || error.status === 403) {
            return socialFailure(res, 'social_verification_failed');
        }

        return socialFailure(res, error.code || error.publicCode || 'google_failed');
    }
}

module.exports = {
    googleLinkStart,
    googleUnlinkStart,
    googleCallbackAuth,
    googleCallback,
};