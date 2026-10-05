const { completeSocialLogin, findOrCreateOAuthUser } = require('../services/socialAuth');
const { sanitizeReturnTo, safeEqual } = require('../utils/oAuthHelpers');
const { randomToken, sha256Base64Url, buildAuthorizeUrl, exchangeCodeForToken, fetchGithubIdentity } = require('../utils/githubOAuth');
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

const fail = (res, code) => res.redirect(`${clientUrl()}/login?error=${encodeURIComponent(code)}`);

function githubStart(req, res) {
    try {
        const state = randomToken();
        const codeVerifier = randomToken();
        const returnTo = sanitizeReturnTo(req.query.returnTo);

        res.cookie(STATE_COOKIE, JSON.stringify({ state, codeVerifier, returnTo }), {
            ...cookieOptions(),
            maxAge: STATE_TTL_MS,
        });

        return res.redirect(buildAuthorizeUrl({ state, codeChallenge: sha256Base64Url(codeVerifier) }));
    } catch (err) {
        console.error('[github-oauth] start failed:', err.message);
        return fail(res, 'github_failed');
    }
}

async function githubCallback(req, res) {
    const saved = readStateCookie(req);
    res.clearCookie(STATE_COOKIE, cookieOptions());

    try {
        const { code, state, error } = req.query;

        if (error) return fail(res, error === 'access_denied' ? 'github_denied' : 'github_failed');
        if (!saved || typeof code !== 'string' || !safeEqual(saved.state, state)) return fail(res, 'invalid_state');

        const accessToken = await exchangeCodeForToken(code, saved.codeVerifier);
        const identity = await fetchGithubIdentity(accessToken);

        const user = await findOrCreateOAuthUser({ provider: 'github', ...identity });
        const result = await completeSocialLogin({ req, res, user, provider: 'GitHub' });

        if (result.mfaRequired) {
            const fragment = new URLSearchParams({ mfaToken: result.mfaToken, methods: result.methods.join(',') });
            return res.redirect(`${clientUrl()}/login#${fragment}`);
        }

        return res.redirect(`${clientUrl()}${sanitizeReturnTo(saved.returnTo)}`);
    } catch (err) {
        console.error('[github-oauth] callback failed:', err.publicCode || err.message);
        return fail(res, err.publicCode || 'github_failed');
    }
}

module.exports = { githubStart, githubCallback };