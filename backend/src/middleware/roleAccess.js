const Staff = require('../models/staff');

const ROLE_PERMISSIONS = {
    super_admin: ['*'],
    admin: ['*'],
    cinema_manager: [
        'staff:self', 'staff:read', 'staff:manage',
        'shifts:self', 'shifts:read', 'shifts:manage',
    ],
    staff: ['staff:self', 'shifts:self', 'tickets:scan'],
    customer: ['customer:self'],
};

function roleName(role) {
    if (!role) return null;
    if (typeof role === 'string') return role.toLowerCase();
    return String(role.name || '').toLowerCase();
}

function hasPermission(activeRole, permission) {
    const name = roleName(activeRole);
    const permissions = ROLE_PERMISSIONS[name] || [];
    return permissions.includes('*') || permissions.includes(permission);
}

function requirePermission(permission) {
    return async function permissionGuard(req, res, next) {
        try {
            if (!req.user || !req.activeRole) return res.status(401).json({ error: 'Authentication required.' });

            if (!hasPermission(req.activeRole, permission)) {
                return res.status(403).json({
                    error: 'You do not have permission to perform this action.',
                    code: 'INSUFFICIENT_ROLE_PERMISSION',
                    requiredPermission: permission,
                    activeRole: roleName(req.activeRole),
                });
            }

            if (roleName(req.activeRole) === 'cinema_manager') {
                const staffProfile = await Staff.findOne({
                    user: req.user._id,
                    isActive: true,
                }).select('cinema position');

                if (!staffProfile || String(staffProfile.position || '').toLowerCase() !== 'manager') {
                    return res.status(403).json({
                        error: 'A valid active cinema-manager staff profile is required.',
                        code: 'MANAGER_PROFILE_REQUIRED',
                    });
                }

                req.accessScope = { cinemaId: staffProfile.cinema };
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