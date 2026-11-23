const express = require('express');
const rateLimit = require('express-rate-limit');
const { requireAuth } = require('../middleware/auth');
const { getMe, selectRole, switchRole, refreshSession } = require('../controllers/multiRole');
const { resolveRolePermissions } = require('../services/permissionService');

const router = express.Router();
const roleActionLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 20,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'Too many role-management requests. Please try again later.' },
});

function sameOrigin(req, res, next) {
    const origin = req.get('origin');
    if (!origin) return res.status(403).json({ error: 'Request origin could not be verified.' });

    const allowed = [
        'http://localhost:3000',
        'http://localhost:5173',
        process.env.CLIENT_URL?.replace(/\/$/, ''),
        process.env.FRONTEND_URL?.replace(/\/$/, ''),
    ].filter(Boolean);

    if (!allowed.includes(origin)) return res.status(403).json({ error: 'Request origin is not allowed.' });
    return next();
}

router.get('/me', requireAuth, getMe);
router.get('/permissions', requireAuth, async (req, res, next) => {
    try {
        const permissionSet = await resolveRolePermissions(req.activeRole?._id);
        return res.json({
            activeRole: req.activeRole ? {
                id: req.activeRole._id,
                name: req.activeRole.name,
            } : null,
            unrestricted: Boolean(permissionSet?.unrestricted),
            permissions: permissionSet?.unrestricted ? ['*'] : [...(permissionSet?.keys || [])].sort(),
        });
    } catch (error) {
        return next(error);
    }
});
router.post('/select-role', sameOrigin, roleActionLimiter, requireAuth, selectRole);
router.post('/switch-role', sameOrigin, roleActionLimiter, requireAuth, switchRole);
router.post('/refresh-token', refreshSession);

module.exports = router;