const { roleName } = require('./roleAccess');

function requireEmailTemplateAdmin(req, res, next) {
    if (!['admin', 'super_admin'].includes(roleName(req.activeRole))) {
        return res.status(403).json({
            error: 'Only Admin and Super Admin roles can manage email templates.',
            code: 'EMAIL_TEMPLATE_ADMIN_REQUIRED',
        });
    }
    return next();
}

module.exports = requireEmailTemplateAdmin;
