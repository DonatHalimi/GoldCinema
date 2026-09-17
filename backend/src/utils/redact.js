const SENSITIVE_KEYS = new Set([
    'password', 'passwordhash', 'currentpassword', 'newpassword',
    'token', 'accesstoken', 'refreshtoken', 'mfatoken', 'trusteddevicetoken',
    'code', 'otp', 'cvc', 'cvv', 'cardnumber', 'secret', 'totpsecret',
    'authorization', 'cookie', 'giftcardcode',
]);

const MAX_DEPTH = 6;
const MAX_STRING_LENGTH = 2000;

function redact(value, depth = 0) {
    if (value === null || value === undefined) return value;
    if (depth > MAX_DEPTH) return '[TRUNCATED]';

    if (typeof value === 'string') return value.length > MAX_STRING_LENGTH ? `${value.slice(0, MAX_STRING_LENGTH)}...[TRUNCATED]` : value;

    if (Array.isArray(value)) return value.slice(0, 50).map((item) => redact(item, depth + 1));

    if (typeof value === 'object') {
        const result = {};
        for (const [key, val] of Object.entries(value)) {
            if (SENSITIVE_KEYS.has(key.toLowerCase())) {
                result[key] = '[REDACTED]';
            } else {
                result[key] = redact(val, depth + 1);
            }
        }
        return result;
    }

    return value;
}

module.exports = { redact };