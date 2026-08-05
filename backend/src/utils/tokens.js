const crypto = require('crypto');

const VERIFICATION_TOKEN_TTL_MS = 24 * 60 * 60 * 1000;
const PASSWORD_RESET_TOKEN_TTL_MS = 60 * 60 * 1000;

function generateVerificationToken() {
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + VERIFICATION_TOKEN_TTL_MS);
    return { token, expiresAt };
}

function generatePasswordResetToken() {
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + PASSWORD_RESET_TOKEN_TTL_MS);
    return { token, expiresAt };
}

module.exports = {
    generateVerificationToken,
    generatePasswordResetToken,
    VERIFICATION_TOKEN_TTL_MS,
    PASSWORD_RESET_TOKEN_TTL_MS,
};