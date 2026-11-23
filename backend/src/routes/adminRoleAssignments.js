const express = require('express');
const rateLimit = require('express-rate-limit');
const { requireAuth } = require('../middleware/auth');
const { requirePermission } = require('../middleware/roleAccess');
const { getRoleCatalog, getUserRoles, updateUserRoles } = require('../controllers/adminRoleAssignments');

const router = express.Router();
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 10,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'Too many role-assignment changes. Please try again later.' },
});

function sameOrigin(req, res, next) {
    const origin = req.get('origin');
    const allowed = [
        'http://localhost:3000',
        'http://localhost:5173',
        process.env.CLIENT_URL?.replace(/\/$/, ''),
        process.env.FRONTEND_URL?.replace(/\/$/, ''),
    ].filter(Boolean);
    if (!origin || !allowed.includes(origin)) return res.status(403).json({ error: 'Request origin is not allowed.' });
    return next();
}

router.use(requireAuth);
router.get('/role-catalog', requirePermission('roles:read'), getRoleCatalog);
router.get('/users/:id/roles', requirePermission('users:read'), getUserRoles);
router.patch('/users/:id/roles', requirePermission('users:manage'), sameOrigin, limiter, updateUserRoles);

module.exports = router;