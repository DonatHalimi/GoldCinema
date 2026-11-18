const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/user');
const Role = require('../models/role');

const SAFE_SELECT = 'name email role roles avatar emailVerified isActive createdAt updatedAt';

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
        const { name, email, password } = req.body;
        if (!name?.trim() || !email?.trim() || !password || password.length < 8) return res.status(400).json({ error: 'Name, valid email and a password of at least 8 characters are required.' });

        const normalizedEmail = email.trim().toLowerCase();
        if (await User.exists({ email: normalizedEmail })) return res.status(409).json({ error: 'Email is already in use.' });

        const customerRole = await Role.findOne({ name: 'customer' });
        if (!customerRole) return res.status(500).json({ error: 'Customer role is missing. Run the multi-role migration.' });

        const passwordHash = await bcrypt.hash(password, 12);
        const user = await User.create({ name: name.trim(), email: normalizedEmail, passwordHash, role: customerRole._id, roles: [customerRole._id] });

        return res.status(201).json({ success: true, data: { id: user._id, name: user.name, email: user.email, roles: [{ _id: customerRole._id, name: customerRole.name }] } });
    } catch (error) { return next(error); }
}

async function updateUser(req, res, next) {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) return res.status(400).json({ error: 'Invalid user ID.' });

        const allowed = ['name', 'email', 'isActive', 'emailVerified'];
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
        return res.json({ success: true, data: { id: user._id, name: user.name, email: user.email, isActive: user.isActive, emailVerified: user.emailVerified } });
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