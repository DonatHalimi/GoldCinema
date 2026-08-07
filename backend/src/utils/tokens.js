const crypto = require('crypto');
const jwt = require('jsonwebtoken');
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

function generateMfaPendingToken(userId) {
    return jwt.sign({ id: userId, purpose: 'mfa_pending' }, process.env.JWT_SECRET, { expiresIn: '5m' });
}

function verifyMfaPendingToken(token) {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.purpose !== 'mfa_pending') throw new Error('Invalid token purpose');
    return decoded;
}

function generateBackupCodes(count = 10) {
    return Array.from({ length: count }, () => crypto.randomBytes(5).toString('hex'));
}

function generateDeviceToken() {
    return crypto.randomBytes(32).toString('hex');
}

function hashDeviceToken(token) {
    return crypto.createHash('sha256').update(token).digest('hex');
}

module.exports = {
    generateVerificationToken,
    generatePasswordResetToken,
    VERIFICATION_TOKEN_TTL_MS,
    PASSWORD_RESET_TOKEN_TTL_MS,
    generateMfaPendingToken,
    verifyMfaPendingToken,
    generateBackupCodes,
    generateDeviceToken,
    hashDeviceToken,
};