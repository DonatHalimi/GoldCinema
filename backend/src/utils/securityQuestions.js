const { hashRecoveryKey } = require('../services/securityQuestionService');

function normalizeIdentifier(value) {
    return String(value || '').normalize('NFKC').trim().toLowerCase();
}

function escapeRegex(value) {
    return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function getClientIp(req) {
    return req.ip || req.socket?.remoteAddress || 'unknown';
}

function recoveryKeys(identifier, req, accountId = null) {
    return {
        accountKey: hashRecoveryKey(`account:${accountId || normalizeIdentifier(identifier)}`),
        ipKey: hashRecoveryKey(`ip:${getClientIp(req)}`),
    };
}

module.exports = {
    normalizeIdentifier,
    escapeRegex,
    getClientIp,
    recoveryKeys,
};