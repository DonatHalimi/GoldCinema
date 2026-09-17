const AuditLog = require('../models/auditLog');
const { redact } = require('../utils/redact');

const ALLOWED_LEVELS = ['error', 'warning', 'info'];
const MAX_MESSAGE_LENGTH = 2000;
const MAX_STACK_LENGTH = 4000;

async function createClientLog(req, res, next) {
    try {
        const { level, message, stack, url, context } = req.body || {};

        if (!message || typeof message !== 'string') {
            return res.status(400).json({ error: 'A log message is required.' });
        }

        const severity = ALLOWED_LEVELS.includes(level) ? level : 'error';

        await AuditLog.create({
            category: severity === 'info' ? 'client_event' : 'client_error',
            action: 'client.log',
            severity: severity === 'warning' ? 'warning' : severity === 'info' ? 'info' : 'error',
            actor: {
                userId: req.user?.id || null,
                ip: req.headers['x-forwarded-for']?.split(',')[0].trim() || req.socket?.remoteAddress || null,
                userAgent: req.headers['user-agent'] || null,
            },
            metadata: redact({
                message: String(message).slice(0, MAX_MESSAGE_LENGTH),
                stack: stack ? String(stack).slice(0, MAX_STACK_LENGTH) : undefined,
                url: url ? String(url).slice(0, 500) : undefined,
                context: context && typeof context === 'object' ? context : undefined,
            }),
            expiresAt: new Date(Date.now() + (severity === 'info' ? 90 : 30) * 24 * 60 * 60 * 1000),
        });

        res.status(202).json({ received: true });
    } catch (err) {
        next(err);
    }
}

module.exports = { createClientLog };