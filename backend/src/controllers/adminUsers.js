const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/user');
const Role = require('../models/role');
const Staff = require('../models/staff');
const Cinema = require('../models/cinema');
const { resolveRolePermissions } = require('../services/permissionService');

const SAFE_SELECT = 'name email role roles avatar phoneNumber emailVerified isActive createdAt updatedAt';

async function getUsers(req, res, next) {
    try {
        const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
        const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 10, 1), 100);
        const filter = {};

        if (req.query.search) {
            const search = String(req.query.search).trim().slice(0, 100);
            filter.$or = [
                { name: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } },
            ];
        }

        const [data, total] = await Promise.all([
            User.find(filter).select(SAFE_SELECT).populate('role', 'name description').populate('roles', 'name description')
                .sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit),
            User.countDocuments(filter),
        ]);

        return res.json({ success: true, data, total, page, pages: Math.ceil(total / limit) || 1 });
    } catch (error) { return next(error); }
}

async function getUser(req, res, next) {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) return res.status(400).json({ error: 'Invalid user ID.' });

        const user = await User.findById(req.params.id).select(SAFE_SELECT).populate('role', 'name description').populate('roles', 'name description');
        if (!user) return res.status(404).json({ error: 'User not found.' });

        return res.json({ success: true, data: user });
    } catch (error) { return next(error); }
}

async function createUser(req, res, next) {
    try {
        const { name, email, password, phoneNumber, avatar, isActive = true } = req.body;
        const names = [...new Set((req.body.roles?.length ? req.body.roles : ['customer']).map((role) => String(role).trim().toLowerCase()))];
        const isStaffManager = names.includes('cinema_manager') || names.includes('staff_manager');
        if (isStaffManager && !names.includes('staff')) names.push('staff');
        const requiresStaffProfile = names.includes('staff') || isStaffManager;

        const normalizedEmail = email.trim().toLowerCase();
        if (await User.exists({ email: normalizedEmail })) return res.status(409).json({ error: 'Email is already in use.' });

        const roles = await Role.find({ name: { $in: names } });
        if (roles.length !== names.length) return res.status(409).json({ error: 'One or more selected roles are no longer available.' });
        const actorPermissions = await resolveRolePermissions(req.activeRole?._id);
        if (!actorPermissions?.unrestricted && roles.some((role) => role.unrestricted)) {
            return res.status(403).json({ error: 'Only an unrestricted administrator can assign unrestricted roles.' });
        }

        let staffCinema = null;
        if (requiresStaffProfile) {
            staffCinema = req.accessScope?.cinemaId
                ? await Cinema.findById(req.accessScope.cinemaId)
                : await Cinema.findOne().sort({ createdAt: 1 });
            if (!staffCinema) {
                return res.status(409).json({ error: 'A cinema must exist before assigning a staff role.' });
            }
        }

        const passwordHash = await bcrypt.hash(password, 12);
        const primaryRole = roles.find((role) => role.name === 'customer') || roles[0];
        const user = await User.create({
            name: name.trim(),
            email: normalizedEmail,
            passwordHash,
            authProviders: ['password'],
            role: primaryRole._id,
            roles: roles.map((role) => role._id),
            phoneNumber: phoneNumber || null,
            avatar: avatar || null,
            isActive,
        });

        let staffProfile = null;
        if (requiresStaffProfile) {
            try {
                const employeePrefix = isStaffManager ? 'MGR' : 'STF';
                staffProfile = await Staff.create({
                    user: user._id,
                    employeeId: `${employeePrefix}-${String(user._id).toUpperCase()}`,
                    position: isStaffManager ? 'manager' : 'usher',
                    cinema: staffCinema._id,
                    isActive,
                });
            } catch (error) {
                await user.deleteOne();
                throw error;
            }
        }

        return res.status(201).json({
            success: true,
            data: {
                id: user._id,
                name: user.name,
                email: user.email,
                phoneNumber: user.phoneNumber,
                avatar: user.avatar,
                isActive: user.isActive,
                roles: roles.map((role) => ({ _id: role._id, name: role.name, description: role.description || '' })),
                staffProfile: staffProfile ? {
                    id: staffProfile._id,
                    employeeId: staffProfile.employeeId,
                    position: staffProfile.position,
                    cinema: staffProfile.cinema,
                } : null,
            },
        });
    } catch (error) { return next(error); }
}

async function updateUser(req, res, next) {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) return res.status(400).json({ error: 'Invalid user ID.' });

        const allowed = ['name', 'email', 'phoneNumber', 'avatar', 'isActive', 'emailVerified'];
        const keys = Object.keys(req.body || {});
        const invalid = keys.filter((key) => !allowed.includes(key));

        if (invalid.length) return res.status(400).json({ error: `Unsupported user field(s): ${invalid.join(', ')}. Use the dedicated role-assignment endpoint for roles.` });

        const user = await User.findById(req.params.id).populate('roles');
        if (!user) return res.status(404).json({ error: 'User not found.' });

        if (user.roles?.some((role) => role.name === 'super_admin') && req.body.isActive === false) {
            const superAdminRole = await Role.findOne({ name: 'super_admin' });
            const activeCount = await User.countDocuments({ roles: superAdminRole._id, isActive: true, _id: { $ne: user._id } });
            if (activeCount < 1) return res.status(409).json({ error: 'At least one active super administrator must remain.' });
        }

        if (String(user._id) === String(req.user._id) && req.body.isActive === false) return res.status(409).json({ error: 'You cannot deactivate your own account from this screen.' });

        if (req.body.name !== undefined) user.name = String(req.body.name).trim();
        if (req.body.phoneNumber !== undefined) {
            const phoneNumber = String(req.body.phoneNumber).trim();
            if (phoneNumber.length > 32) return res.status(400).json({ error: 'Phone number must be 32 characters or fewer.' });
            user.phoneNumber = phoneNumber || null;
        }
        if (req.body.avatar !== undefined) {
            const avatar = String(req.body.avatar).trim();
            if (avatar.length > 2048) return res.status(400).json({ error: 'Avatar path must be 2048 characters or fewer.' });
            user.avatar = avatar || null;
        }

        if (req.body.email !== undefined) {
            const email = String(req.body.email).trim().toLowerCase();
            if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
                return res.status(400).json({ error: 'A valid email address is required.' });
            }
            if (await User.exists({ email, _id: { $ne: user._id } })) {
                return res.status(409).json({ error: 'Email is already in use.' });
            }
            if (email !== user.email) user.emailVerified = false;
            user.email = email;
        }

        if (req.body.isActive !== undefined) user.isActive = req.body.isActive;

        if (req.body.emailVerified !== undefined) user.emailVerified = req.body.emailVerified;

        await user.save();
        return res.json({ success: true, data: { id: user._id, name: user.name, email: user.email, phoneNumber: user.phoneNumber, avatar: user.avatar, isActive: user.isActive, emailVerified: user.emailVerified } });
    } catch (error) { return next(error); }
}

async function deleteUser(req, res, next) {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) return res.status(400).json({ error: 'Invalid user ID.' });
        if (String(req.params.id) === String(req.user._id)) return res.status(409).json({ error: 'You cannot delete your own account here.' });

        const user = await User.findById(req.params.id).populate('roles');
        if (!user) return res.status(404).json({ error: 'User not found.' });

        if (user.roles?.some((role) => role.name === 'super_admin')) {
            const superAdminRole = await Role.findOne({ name: 'super_admin' });
            const activeCount = await User.countDocuments({ roles: superAdminRole._id, isActive: true, _id: { $ne: user._id } });
            if (activeCount < 1) return res.status(409).json({ error: 'The last active super administrator cannot be deleted.' });
        }

        await user.deleteOne();
        return res.json({ success: true, message: 'User deleted.', id: req.params.id });
    } catch (error) { return next(error); }
}


async function deleteUsersBulk(req, res, next) {
    try {
        const ids = Array.isArray(req.body?.ids) ? [...new Set(req.body.ids.map(String))] : [];
        if (!ids.length || ids.some((id) => !mongoose.Types.ObjectId.isValid(id))) {
            return res.status(400).json({ error: 'Provide a non-empty array of valid user IDs.' });
        }

        if (ids.includes(String(req.user._id))) return res.status(409).json({ error: 'You cannot bulk-delete your own account.' });

        const targets = await User.find({ _id: { $in: ids } }).populate('roles');

        const includesSuperAdmin = targets.some((user) => user.roles?.some((role) => role.name === 'super_admin'));
        if (includesSuperAdmin) {
            const superAdminRole = await Role.findOne({ name: 'super_admin' });
            const remaining = await User.countDocuments({ roles: superAdminRole._id, isActive: true, _id: { $nin: ids } });
            if (remaining < 1) return res.status(409).json({ error: 'Bulk deletion would remove the last active super administrator.' });
        }

        const result = await User.deleteMany({ _id: { $in: ids } });
        return res.json({ success: true, deletedCount: result.deletedCount });
    } catch (error) { return next(error); }
}

module.exports = { getUsers, getUser, createUser, updateUser, deleteUser, deleteUsersBulk };