const crypto = require('crypto');
const { oauthError } = require('./oauthHelpers');
const AUTHORIZE_URL = 'https://github.com/login/oauth/authorize';
const TOKEN_URL = 'https://github.com/login/oauth/access_token';
const API_BASE = 'https://api.github.com';
const SCOPE = 'read:user user:email';
const REQUEST_TIMEOUT_MS = 8000;

function getConfig() {
    const { GITHUB_CLIENT_ID: clientId, GITHUB_CLIENT_SECRET: clientSecret, GITHUB_CALLBACK_URL: callbackUrl, } = process.env;

    if (!clientId || !clientSecret || !callbackUrl) throw oauthError('github_failed', 'GitHub OAuth is not configured.');

    return { clientId, clientSecret, callbackUrl };
}

const randomToken = (bytes = 32) => crypto.randomBytes(bytes).toString('base64url');
const sha256Base64Url = (value) => crypto.createHash('sha256').update(value).digest('base64url');

function buildAuthorizeUrl({ state, codeChallenge }) {
    const { clientId, callbackUrl } = getConfig();
    const params = new URLSearchParams({
        client_id: clientId,
        redirect_uri: callbackUrl,
        scope: SCOPE,
        state,
        code_challenge: codeChallenge,
        code_challenge_method: 'S256',
        allow_signup: 'true',
    });
    return `${AUTHORIZE_URL}?${params}`;
}

async function exchangeCodeForToken(code, codeVerifier) {
    const { clientId, clientSecret, callbackUrl } = getConfig();

    const response = await fetch(TOKEN_URL, {
        method: 'POST',
        headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
        body: JSON.stringify({
            client_id: clientId,
            client_secret: clientSecret,
            code,
            redirect_uri: callbackUrl,
            code_verifier: codeVerifier,
        }),
        signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });

    const data = await response.json().catch(() => ({}));
    if (!response.ok || data.error || !data.access_token) throw oauthError('github_failed', `Token exchange failed: ${data.error || response.status}`);

    return data.access_token;
}

async function githubGet(path, accessToken) {
    const response = await fetch(`${API_BASE}${path}`, {
        headers: {
            Authorization: `Bearer ${accessToken}`,
            Accept: 'application/vnd.github+json',
            'X-GitHub-Api-Version': '2022-11-28',
            'User-Agent': 'GoldCinema',
        },
        signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });

    if (!response.ok) throw oauthError('github_failed', `GitHub API ${path} returned ${response.status}`);
    return response.json();
}

function pickVerifiedEmail(emails) {
    const verified = (Array.isArray(emails) ? emails : []).filter((item) => item.verified);
    const chosen = verified.find((item) => item.primary) || verified[0];
    return chosen?.email?.toLowerCase() || null;
}

async function fetchGithubIdentity(accessToken) {
    const [profile, emails] = await Promise.all([
        githubGet('/user', accessToken),
        githubGet('/user/emails', accessToken),
    ]);

    const email = pickVerifiedEmail(emails);
    if (!email) throw oauthError('github_no_verified_email');

    return {
        providerUserId: String(profile.id),
        login: profile.login,
        name: profile.name || profile.login,
        email,
        avatar: profile.avatar_url || null,
    };
}

module.exports = {
    randomToken,
    sha256Base64Url,
    buildAuthorizeUrl,
    exchangeCodeForToken,
    fetchGithubIdentity,
    pickVerifiedEmail,
};