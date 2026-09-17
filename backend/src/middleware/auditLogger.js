const crypto = require('crypto');
const AuditLog = require('../models/auditLog');
const { redact } = require('../utils/redact');

const RETENTION_DAYS = {
    api_request: 30,
    auth: 365,
    payment: 2555,
};

const BODY_EXCLUDED_PATHS = ['/api/payments/stripe/webhook'];

function classify(path) {
    if (path.startsWith('/api/auth')) return 'auth';
    if (path.startsWith('/api/payments') || path.startsWith('/api/giftcards')) return 'payment';
    return 'api_request';
}

function computeExpiry(category) {
    const days = RETENTION_DAYS[category] ?? 30;
    return new Date(Date.now() + days * 24 * 60 * 60 * 1000);
}

function getResource(path) {
    const segments = path.split('/').filter(Boolean);

    if (segments[0] !== 'api' || !segments[1]) return { type: null, id: null, };

    let resourceType = null;
    let resourceId = null;

    if (segments[1] === 'admin' && segments[2]) {
        resourceType = segments[2];
        resourceId = segments[3] || null;
    } else {
        resourceType = segments[1];
        resourceId = segments[2] || null;
    }

    const actionSegments = [
        'login',
        'logout',
        'google',
        'facebook',
        'refresh',
        'verify',
        'resend',
        'forgot-password',
        'reset-password',
        'webhook',
    ];

    if (actionSegments.includes(resourceType)) return { type: null, id: null, };

    return { type: resourceType || null, id: resourceId || null, };
}

function auditRequestLogger(req, res, next) {
    const requestId = crypto.randomUUID();

    req.requestId = requestId;

    const startedAt = Date.now();

    res.on('finish', () => {
        try {
            const path = req.originalUrl.split('?')[0];
            const category = classify(path);

            const shouldCaptureBody =
                req.method !== 'GET' &&
                !BODY_EXCLUDED_PATHS.includes(path) &&
                req.is('application/json');

            const doc = {
                category,
                requestId,
                method: req.method,
                path,
                statusCode: res.statusCode,
                durationMs: Date.now() - startedAt,

                actor: {
                    userId: req.user?.id || req.user?._id || null,
                    email: req.user?.email || null,
                    role:
                        typeof req.user?.role === 'object'
                            ? req.user.role?.name
                            : req.user?.role || null,
                    ip:
                        req.headers['x-forwarded-for']?.split(',')[0].trim() ||
                        req.socket?.remoteAddress ||
                        null,
                    userAgent: req.headers['user-agent'] || null,
                },

                resource: getResource(path),

                metadata: shouldCaptureBody ? redact(req.body) : undefined,

                severity: res.statusCode >= 500 ? 'error' : res.statusCode >= 400 ? 'warning' : 'info',

                expiresAt: computeExpiry(category),
            };

            AuditLog.create(doc).catch((err) => { console.error('[audit] Failed to persist request log:', err.message); });
        } catch (err) {
            console.error('[audit] Failed to build request log:', err.message);
        }
    });

    next();
}

module.exports = { auditRequestLogger };