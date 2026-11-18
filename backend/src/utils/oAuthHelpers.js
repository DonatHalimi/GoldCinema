const crypto = require('crypto');

const MAX_RETURN_TO_LENGTH = 200;

const OAUTH_ERROR_STATUS = {
    account_exists: 409,
    provider_already_linked: 409,
    social_identity_in_use: 409,
    social_identity_incomplete: 400,
    github_no_verified_email: 400,
    github_failed: 400,
};

const oauthError = (publicCode, message) =>
    Object.assign(new Error(message || publicCode),
        {
            publicCode,
            status: OAUTH_ERROR_STATUS[publicCode] || 400,
        }
    );

function sanitizeReturnTo(value) {
    if (typeof value !== 'string' || value.length > MAX_RETURN_TO_LENGTH) return '/';
    if (/[\u0000-\u001f]/.test(value)) return '/';
    return /^\/(?![/\\])/.test(value) ? value : '/';
}

function safeEqual(a, b) {
    if (typeof a !== 'string' || typeof b !== 'string') return false;
    const x = Buffer.from(a);
    const y = Buffer.from(b);
    return (x.length === y.length && crypto.timingSafeEqual(x, y));
}

module.exports = { oauthError, sanitizeReturnTo, safeEqual };