
const crypto = require('crypto');
const User = require('../models/user');

const {
    completeSocialLogin,
    findOrCreateOAuthUser,
    linkProviderIdentity,
    unlinkProviderIdentity,
    assertCanUnlinkProvider,
    getLinkedProviders,
} = require('../services/socialAuth');

const {
    sanitizeReturnTo,
    safeEqual,
} = require('../utils/oAuthHelpers');

const {
    randomToken,
    sha256Base64Url,
    buildAuthorizeUrl,
    exchangeCodeForToken,
    fetchGithubIdentity,
} = require('../utils/githubOAuth');

const STATE_COOKIE = 'gh_oauth';
const STATE_COOKIE_PATH = '/api/auth/github';
const STATE_TTL_MS = 10 * 60 * 1000;

const clientUrl = () => (process.env.CLIENT_URL || 'http://localhost:3000').replace(/\/$/, '');

const cookieOptions = () => ({
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: STATE_COOKIE_PATH,
});

function readStateCookie(req) {
    try {
        const value = JSON.parse(req.cookies?.[STATE_COOKIE]);
        return value?.state && value?.codeVerifier ? value : null;
    } catch {
        return null;
    }
}

function signStateData(stateData) {
    if (!process.env.JWT_SECRET) {
        throw new Error('JWT_SECRET is not configured.');
    }

    return crypto
        .createHmac('sha256', process.env.JWT_SECRET)
        .update(JSON.stringify(stateData))
        .digest('base64url');
}

function verifyStateSignature(saved) {
    if (!saved?.signature) return false;

    const {
        signature,
        ...stateData
    } = saved;

    try {
        const expected = signStateData(stateData);
        return safeEqual(signature, expected);
    } catch {
        return false;
    }
}

function clearStateCookie(res) {
    res.clearCookie(STATE_COOKIE, cookieOptions());
}

function loginFailure(res, code) {
    return res.redirect(`${clientUrl()}/login?error=${encodeURIComponent(code)}`);
}

function socialFailure(res, code) {
    return res.redirect(`${clientUrl()}/account/profile?socialError=${encodeURIComponent(code)}`);
}

function socialSuccess(res, action) {
    return res.redirect(`${clientUrl()}/account/profile?socialAction=${encodeURIComponent(action)}&provider=github`);
}

function startGithubFlow(req, res, intent = 'login') {
    try {
        const state = randomToken();
        const codeVerifier = randomToken();

        const stateData = {
            state,
            codeVerifier,
            intent,
            returnTo: sanitizeReturnTo(req.query.returnTo || '/'),
        };

        if (intent === 'link' || intent === 'unlink') {
            const userId = String(req.user?._id || req.user?.id);
            const refreshToken = req.cookies?.refreshToken;

            if (!userId || !refreshToken) {
                throw new Error('An active GoldCinema session is required for this operation.');
            }

            stateData.userId = userId;
            stateData.refreshTokenHash = sha256Base64Url(refreshToken);
            stateData.createdAt = Date.now();
        }

        const signedStateData = {
            ...stateData,
            signature: signStateData(stateData),
        };

        res.cookie(
            STATE_COOKIE,
            JSON.stringify(signedStateData),
            {
                ...cookieOptions(),
                maxAge: STATE_TTL_MS,
            }
        );

        const authorizeUrl = buildAuthorizeUrl({
            state,
            codeChallenge: sha256Base64Url(codeVerifier),
        });

        return res.redirect(authorizeUrl);
    } catch (err) {
        console.error('[github-oauth] start failed:', err.message);

        if (intent === 'login') return loginFailure(res, 'github_failed');

        return socialFailure(res, 'github_failed');
    }
}

function githubStart(req, res) {
    return startGithubFlow(req, res, 'login');
}

function githubLinkStart(req, res) {
    return startGithubFlow(req, res, 'link');
}

async function githubUnlinkStart(req, res) {
    try {
        const user = await User.findById(req.user._id || req.user.id)
            .select('+passwordHash');

        if (!user) {
            return socialFailure(res, 'user_not_found');
        }

        const hasOtherLinkedProvider = getLinkedProviders(user).some(
            (provider) => provider !== 'github'
        );
        if (user.passwordHash || (!hasOtherLinkedProvider && !user.passkeys?.length)) {
            return socialFailure(res, 'github_unlink_requires_confirmation');
        }

        assertCanUnlinkProvider(user, 'github');

        return startGithubFlow(req, res, 'unlink');
    } catch (err) {
        console.error('[github-oauth] unlink start failed:', err.message);

        if (err.publicCode === 'password_required') return socialFailure(res, 'password_required');

        if (err.status === 409) return socialFailure(res, 'last_login_method');

        return socialFailure(res, 'github_failed');
    }
}

async function githubCallbackAuth(req, res, next) {
    const saved = readStateCookie(req);

    if (!saved || saved.intent === 'login') return next();

    if (!verifyStateSignature(saved) || !saved.userId || !saved.refreshTokenHash || !saved.createdAt) {
        return socialFailure(res, 'invalid_state');
    }

    try {
        const user = await User.findById(saved.userId).select('+passwordHash');

        if (!user || user.isActive === false) return socialFailure(res, 'session_changed');

        const now = new Date();

        const activeSession = (user.refreshTokens || []).some(
            (session) =>
                session.token &&
                sha256Base64Url(session.token) === saved.refreshTokenHash &&
                session.expiresAt > now &&
                !session.revokedAt
        );

        if (!activeSession) return socialFailure(res, 'session_changed');

        if (user.tokensInvalidatedAt && new Date(user.tokensInvalidatedAt).getTime() > Number(saved.createdAt)) {
            return socialFailure(res, 'session_changed');
        }

        req.user = user;

        return next();
    } catch (err) {
        console.error('[github-oauth] callback session validation failed:', err.message);

        return socialFailure(res, 'session_changed');
    }
}

async function githubCallback(req, res) {
    const saved = readStateCookie(req);

    clearStateCookie(res);

    try {
        const { code, state, error } = req.query;

        const intent = saved?.intent || 'login';

        if (error) {
            const errorCode = error === 'access_denied'
                ? 'github_denied'
                : 'github_failed';

            return intent === 'login'
                ? loginFailure(res, errorCode)
                : socialFailure(res, errorCode);
        }

        if (!saved || !verifyStateSignature(saved) || typeof code !== 'string' || !safeEqual(saved.state, state)) {
            return intent === 'login'
                ? loginFailure(res, 'invalid_state')
                : socialFailure(res, 'invalid_state');
        }

        const accessToken = await exchangeCodeForToken(
            code,
            saved.codeVerifier
        );

        const identity = await fetchGithubIdentity(accessToken);

        if (intent === 'link') {
            if (!req.user || String(req.user._id || req.user.id) !== String(saved.userId)) {
                return socialFailure(res, 'session_changed');
            }

            await linkProviderIdentity(
                saved.userId,
                identity,
                req
            );

            return socialSuccess(res, 'linked');
        }

        if (intent === 'unlink') {
            if (!req.user || String(req.user._id || req.user.id) !== String(saved.userId)) {
                return socialFailure(res, 'session_changed');
            }

            const user = await User.findById(saved.userId).select('+passwordHash');

            if (!user) return socialFailure(res, 'user_not_found');

            const hasOtherLinkedProvider = getLinkedProviders(user).some(
                (provider) => provider !== 'github'
            );

            if (user.passwordHash || (!hasOtherLinkedProvider && !user.passkeys?.length)) {
                return socialFailure(res, 'github_unlink_requires_confirmation');
            }

            assertCanUnlinkProvider(user, 'github');

            await unlinkProviderIdentity(
                user,
                'github',
                req,
                identity
            );

            return socialSuccess(res, 'unlinked');
        }

        const user = await findOrCreateOAuthUser(identity, req);

        const result = await completeSocialLogin({
            req,
            res,
            user,
            provider: 'GitHub',
        });

        if (result.mfaRequired) {
            const fragment = new URLSearchParams({
                mfaToken: result.mfaToken,
                methods: result.methods.join(','),
            });

            return res.redirect(`${clientUrl()}/login#${fragment}`);
        }

        return res.redirect(`${clientUrl()}${sanitizeReturnTo(saved.returnTo)}`);
    } catch (err) {
        console.error('[github-oauth] callback failed:', err.publicCode || err.message);

        const intent = saved?.intent || 'login';

        if (intent === 'login') return loginFailure(res, err.publicCode || 'github_failed');

        if (err.status === 409) {
            return socialFailure(
                res,
                err.publicCode === 'password_required'
                    ? 'password_required'
                    : err.message?.toLowerCase().includes('only sign-in method')
                        ? 'last_login_method'
                        : 'social_action_conflict'
            );
        }

        if (err.status === 401 || err.status === 403) return socialFailure(res, 'social_verification_failed');

        return socialFailure(res, err.publicCode || 'github_failed');
    }
}

module.exports = {
    githubStart,
    githubLinkStart,
    githubUnlinkStart,
    githubCallbackAuth,
    githubCallback,
};