const crypto = require('crypto');

const MAX_RETURN_TO_LENGTH = 200;

const oauthError = (publicCode, message) => Object.assign(new Error(message || publicCode), { publicCode });

function sanitizeReturnTo(value) {
    if (typeof value !== 'string' || value.length > MAX_RETURN_TO_LENGTH) return '/';
    if (/[\u0000-\u001f]/.test(value)) return '/';
    return /^\/(?![/\\])/.test(value) ? value : '/';
}

function safeEqual(a, b) {
    if (typeof a !== 'string' || typeof b !== 'string') return false;
    const x = Buffer.from(a);
    const y = Buffer.from(b);
    return x.length === y.length && crypto.timingSafeEqual(x, y);
}

module.exports = { oauthError, sanitizeReturnTo, safeEqual };