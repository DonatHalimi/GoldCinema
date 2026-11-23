const Staff = require('../models/staff');
const {
    resolveRolePermissions,
    hasAnyPermission,
} = require('../services/permissionService');

const ROLE_PERMISSIONS = {};

function roleName(role) {
    if (!role) return null;
    if (typeof role === 'string') return role.toLowerCase();
    return String(role.name || '').toLowerCase();
}

function hasPermission(activeRole, permission) {
    return false;
}

function requirePermission(...args) {
    const options = args.at(-1) && typeof args.at(-1) === 'object' ? args.pop() : {};
    const permissions = args;
    const mode = options.mode === 'all' ? 'all' : 'any';
    return async function permissionGuard(req, res, next) {
        try {
            if (!req.user || !req.activeRole) return res.status(401).json({ error: 'Authentication required.' });
            const permissionSet = await resolveRolePermissions(req.activeRole._id || req.activeRole);
            const allowed = mode === 'all'
                ? require('../services/permissionService').hasAllPermissions(permissionSet, permissions)
                : hasAnyPermission(permissionSet, permissions);
            if (!allowed) {
                return res.status(403).json({
                    error: 'You do not have permission to perform this action.',
                    code: 'INSUFFICIENT_ROLE_PERMISSION',
                    requiredPermission: permissions,
                    permissionMode: mode,
                    activeRole: roleName(req.activeRole),
                });
            }

            if (allowed) {
                const staffProfile = await Staff.findOne({
                    user: req.user._id,
                    isActive: true,
                    position: 'manager',
                }).select('cinema');
                if (staffProfile) req.accessScope = { cinemaId: staffProfile.cinema };
            }

            return next();
        } catch (error) {
            return next(error);
        }
    };
}

function requireSuperAdmin(req, res, next) {
    if (roleName(req.activeRole) !== 'super_admin') {
        return res.status(403).json({
            error: 'Super administrator access is required.',
            code: 'SUPER_ADMIN_REQUIRED',
        });
    }
    return next();
}

module.exports = { ROLE_PERMISSIONS, roleName, hasPermission, requirePermission, requireSuperAdmin };