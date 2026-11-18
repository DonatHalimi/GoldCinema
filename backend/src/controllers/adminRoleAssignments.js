const mongoose = require('mongoose');
const User = require('../models/user');
const Role = require('../models/role');
const RoleAuditLog = require('../models/roleAuditLog');
const Staff = require('../models/staff');
const Cinema = require('../models/cinema');
const { roleName } = require('../middleware/roleAccess');

const ALLOWED_ROLE_NAMES = ['customer', 'staff', 'cinema_manager', 'admin', 'super_admin'];

async function getRoleCatalog(req, res, next) {
    try {
        const roleNames = roleName(req.activeRole) === 'super_admin'
            ? ALLOWED_ROLE_NAMES
            : ALLOWED_ROLE_NAMES.filter((name) => name !== 'super_admin');
        const roles = await Role.find({ name: { $in: roleNames } }).sort({ name: 1 }).select('name description');
        return res.json({ roles: roles.map((role) => ({ id: role._id, name: role.name, description: role.description || '' })) });
    } catch (error) { return next(error); }
}

async function getUserRoles(req, res, next) {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) return res.status(400).json({ error: 'Invalid user ID.' });
        const user = await User.findById(req.params.id).populate('role roles').select('name email role roles');
        if (!user) return res.status(404).json({ error: 'User not found.' });
        const roles = user.roles?.length ? user.roles : (user.role ? [user.role] : []);
        return res.json({ user: { id: user._id, name: user.name, email: user.email, roles: roles.map((role) => ({ id: role._id, name: role.name, description: role.description || '' })) } });
    } catch (error) { return next(error); }
}

async function updateUserRoles(req, res, next) {
    try {
        const { id } = req.params;
        const requested = req.body?.roles;

        if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ error: 'Invalid user ID.' });

        if (!Array.isArray(requested) || requested.length === 0) return res.status(400).json({ error: 'At least one role must remain assigned.' });

        const names = [...new Set(requested.map((value) => String(value).trim().toLowerCase()))];
        if (names.includes('cinema_manager') && !names.includes('staff')) names.push('staff');
        const invalid = names.filter((name) => !ALLOWED_ROLE_NAMES.includes(name));
        if (invalid.length) return res.status(400).json({ error: `Unsupported role(s): ${invalid.join(', ')}.` });

        const [target, roleDocs] = await Promise.all([
            User.findById(id).populate('role roles'),
            Role.find({ name: { $in: names } }),
        ]);

        if (!target) return res.status(404).json({ error: 'User not found.' });
        if (roleDocs.length !== names.length) return res.status(409).json({ error: 'One or more role documents are missing. Run the multi-role migration first.' });

        if (names.includes('cinema_manager')) {
            const managerProfile = await Staff.findOne({ user: target._id, isActive: true, position: 'manager' }).select('_id');
            const cinemaId = req.body?.managerCinemaId;
            if (!managerProfile || cinemaId) {
                if (!cinemaId && !managerProfile) {
                    return res.status(400).json({ error: 'Select a cinema to create the cinema manager staff profile.' });
                }
                if (!cinemaId) {
                    return res.status(409).json({ error: 'An active manager staff profile is required.' });
                }
                if (!mongoose.Types.ObjectId.isValid(cinemaId)) {
                    return res.status(400).json({ error: 'Select a cinema to create the cinema manager staff profile.' });
                }
                if (!await Cinema.exists({ _id: cinemaId })) {
                    return res.status(404).json({ error: 'Selected cinema was not found.' });
                }

                await Staff.findOneAndUpdate(
                    { user: target._id },
                    {
                        $set: { position: 'manager', cinema: cinemaId, isActive: true },
                        $setOnInsert: {
                            employeeId: `MGR-${String(target._id).toUpperCase()}`,
                            hireDate: new Date(),
                            hourlyRate: 0,
                        },
                    },
                    { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true }
                );
            }
        }
        if (names.includes('staff')) {
            const staffProfile = await Staff.findOne({ user: target._id, isActive: true }).select('_id');
            if (!staffProfile) return res.status(409).json({ error: 'A staff role requires an active Staff profile.' });
        }

        const beforeRoles = target.roles?.length ? target.roles : (target.role ? [target.role] : []);
        const beforeNames = beforeRoles.map((role) => role.name).filter(Boolean);
        const actorIsSuperAdmin = roleName(req.activeRole) === 'super_admin';
        if (!actorIsSuperAdmin && (names.includes('super_admin') || beforeNames.includes('super_admin'))) {
            return res.status(403).json({ error: 'Only a super administrator can assign or change super administrator roles.' });
        }

        if (String(target._id) === String(req.user._id) && beforeNames.includes('super_admin') && !names.includes('super_admin')) {
            return res.status(409).json({ error: 'You cannot remove your own super administrator role.' });
        }

        if (beforeNames.includes('super_admin') && !names.includes('super_admin')) {
            const remainingSuperAdmins = await User.countDocuments({
                roles: { $in: await Role.find({ name: 'super_admin' }).distinct('_id') },
                _id: { $ne: target._id },
                isActive: true,
            });
            if (remainingSuperAdmins < 1) return res.status(409).json({ error: 'At least one active super administrator must remain.' });
        }

        const roleByName = new Map(roleDocs.map((role) => [role.name, role]));
        const newRoles = names.map((name) => roleByName.get(name));
        const newRoleIds = newRoles.map((role) => role._id);

        target.roles = newRoleIds;
        if (!newRoles.some((role) => String(role._id) === String(target.role?._id || target.role))) target.role = newRoles[0]._id;

        const assignedIds = new Set(newRoleIds.map(String));
        for (const session of target.refreshTokens || []) {
            if (session.activeRole && !assignedIds.has(String(session.activeRole))) {
                session.activeRole = null;
                session.roleSelectionComplete = false;
            }
        }

        target.securityEvents.push({
            type: 'roles_updated',
            title: 'Account Roles Updated',
            description: `Assigned roles changed by administrator ${req.user.email || req.user._id}.`,
            createdAt: new Date(),
        });

        await target.save();

        const ip = req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.socket?.remoteAddress || null;
        await RoleAuditLog.create({
            actor: req.user._id,
            target: target._id,
            action: names.some((name) => !beforeNames.includes(name)) ? 'roles_assigned' : 'roles_revoked',
            before: beforeNames,
            after: names,
            ip,
            userAgent: req.get('user-agent') || null,
        });

        return res.json({
            message: 'User roles updated successfully.',
            user: {
                id: target._id,
                name: target.name,
                email: target.email,
                roles: newRoles.map((role) => ({ id: role._id, name: role.name, description: role.description || '' })),
                defaultRole: target.role,
            },
        });
    } catch (error) {
        return next(error);
    }
}

module.exports = { getRoleCatalog, getUserRoles, updateUserRoles };