const Role = require('../models/role');
const User = require('../models/user');
const Permission = require('../models/permission');
const RolePermission = require('../models/rolePermission');
const AuditLog = require('../models/auditLog');
const { PERMISSION_REGISTRY, registryByKey } = require('../config/permissionRegistry');
const { invalidateRole, replaceRolePermissions } = require('../services/permissionService');
const PermissionAuditLog = require('../models/auditLog');
const RESERVED_PERMISSION_RESOURCES = new Set(['admin', 'roles', 'permissions', 'users']);

function permissionSnapshot(permission) {
    return {
        key: permission.key,
        resource: permission.resource,
        action: permission.action,
        category: permission.category,
        description: permission.description,
    };
}

async function auditPermissionChange(req, action, permission, before, after) {
    await PermissionAuditLog.create({
        category: 'admin_mutation',
        action: `permission_${action}`,
        actor: { userId: req.user._id, email: req.user.email, role: req.activeRole?.name, ip: req.ip, userAgent: req.get('user-agent') },
        resource: { type: 'permission', id: String(permission._id) },
        changes: { before, after },
        expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
    });
}

async function getRoles(req, res, next) {
    try {
        const page = Math.max(1, parseInt(req.query.page, 10) || 1);
        const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 10));
        const skip = (page - 1) * limit;
        const search = String(req.query.search || '').trim();
        const filter = search ? { name: { $regex: search, $options: 'i' } } : {};

        const [roles, total, assignmentCounts] = await Promise.all([
            Role.find(filter).skip(skip).limit(limit).sort({ createdAt: -1 }),
            Role.countDocuments(filter),
            Role.aggregate([
                { $match: filter },
                { $lookup: { from: 'users', localField: '_id', foreignField: 'roles', as: 'users' } },
                { $project: { _id: 1, assignedUserCount: { $size: '$users' } } },
            ]),
        ]);
        const counts = new Map(assignmentCounts.map((item) => [String(item._id), item.assignedUserCount]));
        const roleIds = roles.map((role) => role._id);
        const permissionCounts = await RolePermission.aggregate([
            { $match: { role: { $in: roleIds } } },
            { $group: { _id: '$role', count: { $sum: 1 } } },
        ]);
        const permissionCountMap = new Map(permissionCounts.map((item) => [String(item._id), item.count]));

        res.status(200).json({
            data: roles.map((role) => ({
                id: role._id,
                name: role.name,
                description: role.description || '',
                isSystem: role.isSystem,
                isProtected: role.isProtected,
                unrestricted: role.unrestricted,
                permissionCount: permissionCountMap.get(String(role._id)) || 0,
                assignedUserCount: counts.get(String(role._id)) || 0,
                createdAt: role.createdAt,
                updatedAt: role.updatedAt,
            })),
            page,
            pages: Math.ceil(total / limit),
            total,
        });
    } catch (err) {
        next(err);
    }
}

async function createRole(req, res, next) {
    try {
        const { name, description, permissionKeys = [] } = req.body;

        const existingRole = await Role.findOne({ name: name.toLowerCase() });
        if (existingRole) return res.status(400).json({ error: 'Role with this name already exists' });

        if (!Array.isArray(permissionKeys)) {
            return res.status(400).json({ error: 'permissionKeys must be an array.' });
        }
        const role = await Role.create({
            name: name.toLowerCase(),
            description,
            isSystem: false,
            isProtected: false,
            unrestricted: false,
        });
        try {
            await replaceRolePermissions(role._id, permissionKeys);
        } catch (error) {
            await Role.findByIdAndDelete(role._id);
            throw error;
        }
        await AuditLog.create({
            category: 'admin_mutation',
            action: 'role_created',
            actor: { userId: req.user._id, email: req.user.email, role: req.activeRole?.name, ip: req.ip, userAgent: req.get('user-agent') },
            resource: { type: 'role', id: String(role._id) },
            changes: { after: { name: role.name, description: role.description } },
            expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
        });

        res.status(201).json({ message: 'Role created successfully', role });
    } catch (err) {
        next(err);
    }
}

async function updateRole(req, res, next) {
    try {
        const { id } = req.params;
        const { name, description } = req.body;
        const role = await Role.findById(id);
        if (!role) return res.status(404).json({ error: 'Role not found' });
        if (role.isProtected) {
            return res.status(409).json({ error: 'Protected system roles cannot be edited.' });
        }

        if (name) {
            const existingRole = await Role.findOne({
                name: name.toLowerCase(),
                _id: { $ne: id },
            });

            if (existingRole) return res.status(400).json({ error: 'Role with this name already exists' });
        }

        const updatedRole = await Role.findByIdAndUpdate(
            id,
            {
                ...(name && { name: name.toLowerCase() }),
                ...(description !== undefined && { description }),
            },
            { new: true, runValidators: true }
        );

        if (!updatedRole) return res.status(404).json({ error: 'Role not found' });
        await AuditLog.create({
            category: 'admin_mutation',
            action: 'role_updated',
            actor: { userId: req.user._id, email: req.user.email, role: req.activeRole?.name, ip: req.ip, userAgent: req.get('user-agent') },
            resource: { type: 'role', id: String(updatedRole._id) },
            changes: { before: { name: role.name, description: role.description }, after: { name: updatedRole.name, description: updatedRole.description } },
            expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
        });

        res.status(200).json({
            message: 'Role updated successfully',
            role: updatedRole,
        });
    } catch (err) {
        next(err);
    }
}

async function deleteRole(req, res, next) {
    try {
        const { id } = req.params;
        const role = await Role.findById(id);
        if (!role) return res.status(404).json({ error: 'Role not found' });
        if (role.isProtected) return res.status(409).json({ error: 'Protected system roles cannot be deleted.' });
        const assignedCount = await User.countDocuments({ $or: [{ roles: role._id }, { role: role._id }] });
        if (assignedCount) return res.status(409).json({ error: 'Role is still assigned to users.' });
        await RolePermission.deleteMany({ role: role._id });
        const deletedRole = await Role.findByIdAndDelete(id);
        invalidateRole(role._id);
        await AuditLog.create({
            category: 'admin_mutation',
            action: 'role_deleted',
            actor: { userId: req.user._id, email: req.user.email, role: req.activeRole?.name, ip: req.ip, userAgent: req.get('user-agent') },
            resource: { type: 'role', id: String(deletedRole._id) },
            changes: { before: { name: deletedRole.name, description: deletedRole.description }, after: null },
            expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
        });

        res.status(200).json({
            message: 'Role deleted successfully',
            id,
        });
    } catch (err) {
        next(err);
    }
}

async function getRole(req, res, next) {
    try {
        const role = await Role.findById(req.params.id);
        if (!role) return res.status(404).json({ error: 'Role not found' });
        const assignments = await RolePermission.find({ role: role._id }).populate('permission');
        const permissions = assignments
            .map((item) => item.permission)
            .filter((permission) => permission && !permission.isDeleted);
        const assignedUserCount = await User.countDocuments({ roles: role._id });
        return res.json({
            role: {
                id: role._id,
                name: role.name,
                description: role.description || '',
                isSystem: role.isSystem,
                isProtected: role.isProtected,
                unrestricted: role.unrestricted,
                permissionCount: permissions.length,
                assignedUserCount,
                createdAt: role.createdAt,
                updatedAt: role.updatedAt,
                permissions,
            },
        });
    } catch (error) {
        return next(error);
    }
}

async function replacePermissions(req, res, next) {
    try {
        const role = await Role.findById(req.params.id);
        if (!role) return res.status(404).json({ error: 'Role not found' });
        if (role.isProtected || role.unrestricted) {
            return res.status(409).json({ error: 'Protected or unrestricted roles cannot be edited through permission assignments.' });
        }
        const keys = req.body?.permissionKeys;
        if (!Array.isArray(keys)) return res.status(400).json({ error: 'permissionKeys must be an array.' });
        const malformed = keys.filter((key) => typeof key !== 'string' || !/^[a-z][a-z0-9_-]*:[a-z][a-z0-9_-]*$/.test(key));
        if (malformed.length) return res.status(400).json({ error: 'Permission keys must use resource:action format.' });

        const before = await RolePermission.find({ role: role._id }).populate('permission', 'key isDeleted');
        const beforeKeys = before
            .filter((item) => !item.permission?.isDeleted)
            .map((item) => item.permission?.key)
            .filter(Boolean)
            .sort();
        try {
            await replaceRolePermissions(role._id, keys);
        } catch (error) {
            if (error.status) return res.status(error.status).json({ error: error.message });
            throw error;
        }
        const after = [...new Set(keys)].sort();
        const added = after.filter((key) => !beforeKeys.includes(key));
        const removed = beforeKeys.filter((key) => !after.includes(key));

        await AuditLog.create({
            category: 'admin_mutation',
            action: 'role_permissions_replaced',
            actor: { userId: req.user._id, email: req.user.email, role: req.activeRole?.name, ip: req.ip, userAgent: req.get('user-agent') },
            resource: { type: 'role', id: String(role._id) },
            changes: { before: beforeKeys, after },
            metadata: { permissionsAdded: added, permissionsRemoved: removed },
            expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
        });

        const assignments = await RolePermission.find({ role: role._id }).populate('permission');
        return res.json({
            message: 'Role permissions updated successfully.',
            role: { id: role._id, name: role.name, description: role.description || '' },
            permissions: assignments
                .map((item) => item.permission)
                .filter((permission) => permission && !permission.isDeleted),
            permissionsAdded: added,
            permissionsRemoved: removed,
        });
    } catch (error) {
        if (error.status) return res.status(error.status).json({ error: error.message });
        return next(error);
    }
}

async function getPermissions(req, res, next) {
    try {
        const filter = req.query.includeDeleted === 'true' ? {} : { isDeleted: { $ne: true } };
        const [permissions, assignmentCounts] = await Promise.all([
            Permission.find(filter).sort({ category: 1, resource: 1, action: 1 }),
            RolePermission.aggregate([
                { $group: { _id: '$permission', assignedRoleCount: { $sum: 1 } } },
            ]),
        ]);
        const assignmentCountMap = new Map(
            assignmentCounts.map((item) => [String(item._id), item.assignedRoleCount])
        );
        const permissionRows = permissions.map((permission) => ({
            ...permission.toObject(),
            isSystem: permission.isSystem || registryByKey.has(permission.key),
            assignedRoleCount: assignmentCountMap.get(String(permission._id)) || 0,
        }));
        const grouped = permissionRows.reduce((result, permission) => {
            const key = permission.category || 'General';
            (result[key] ||= []).push(permission);
            return result;
        }, {});
        return res.json({ permissions: permissionRows, grouped, registry: PERMISSION_REGISTRY });
    } catch (error) {
        return next(error);
    }
}

async function getGroupedPermissions(req, res, next) {
    try {
        const permissions = await Permission.find({ isDeleted: { $ne: true } }).sort({ category: 1, resource: 1, action: 1 });
        const grouped = permissions.reduce((result, permission) => {
            const key = permission.category || 'General';
            (result[key] ||= []).push(permission);
            return result;
        }, {});
        return res.json({ grouped });
    } catch (error) {
        return next(error);
    }
}

async function createPermission(req, res, next) {
    try {
        const { key, resource, action, description, category } = req.body;
        const normalizedResource = resource.toLowerCase();
        const normalizedAction = action.toLowerCase();
        const permissionKey = `${normalizedResource}:${normalizedAction}`;
        if (key && key.toLowerCase() !== permissionKey) {
            return res.status(400).json({ error: 'Permission key must match resource:action.' });
        }
        if (RESERVED_PERMISSION_RESOURCES.has(normalizedResource)) {
            return res.status(400).json({ error: 'This resource is reserved for system permissions.' });
        }
        if (registryByKey.has(permissionKey)) {
            return res.status(409).json({ error: 'This permission is defined by the system registry.' });
        }
        if (await Permission.exists({ key: permissionKey })) {
            return res.status(409).json({ error: 'A permission with this key already exists.' });
        }

        const permission = await Permission.create({
            key: permissionKey,
            resource: normalizedResource,
            action: normalizedAction,
            description,
            category,
            isSystem: false,
        });
        await PermissionAuditLog.create({
            category: 'admin_mutation',
            action: 'permission_created',
            actor: { userId: req.user._id, email: req.user.email, role: req.activeRole?.name, ip: req.ip, userAgent: req.get('user-agent') },
            resource: { type: 'permission', id: String(permission._id) },
            changes: { after: { key: permission.key, resource: permission.resource, action: permission.action, category: permission.category, description: permission.description } },
            expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
        });
        return res.status(201).json({ message: 'Permission created successfully.', permission });
    } catch (error) {
        if (error.code === 11000) return res.status(409).json({ error: 'A permission with this key already exists.' });
        return next(error);
    }
}

async function updatePermission(req, res, next) {
    try {
        const current = await Permission.findById(req.params.id);
        if (!current) return res.status(404).json({ error: 'Permission not found.' });
        if (current.isDeleted) return res.status(404).json({ error: 'Permission not found.' });
        const isSystemPermission = current.isSystem || registryByKey.has(current.key);

        const { key, resource, action, description, category } = req.body;
        const normalizedResource = resource.toLowerCase();
        const normalizedAction = action.toLowerCase();
        const permissionKey = `${normalizedResource}:${normalizedAction}`;
        if (key && key.toLowerCase() !== permissionKey) {
            return res.status(400).json({ error: 'Permission key must match resource:action.' });
        }
        if (isSystemPermission && (permissionKey !== current.key || normalizedResource !== current.resource || normalizedAction !== current.action)) {
            return res.status(400).json({ error: 'System permission keys cannot be changed.' });
        }
        if (!isSystemPermission && RESERVED_PERMISSION_RESOURCES.has(normalizedResource)) {
            return res.status(400).json({ error: 'This resource is reserved for system permissions.' });
        }
        if (registryByKey.has(permissionKey) && permissionKey !== current.key) {
            return res.status(409).json({ error: 'This permission is defined by the system registry.' });
        }
        if (await Permission.exists({ key: permissionKey, _id: { $ne: current._id } })) {
            return res.status(409).json({ error: 'A permission with this key already exists.' });
        }

        const before = permissionSnapshot(current);
        const assignments = permissionKey === current.key
            ? []
            : await RolePermission.find({ permission: current._id }).select('role');
        const permission = await Permission.findByIdAndUpdate(
            current._id,
            { $set: { key: permissionKey, resource: normalizedResource, action: normalizedAction, description, category } },
            { new: true, runValidators: true }
        );
        if (!permission) return res.status(404).json({ error: 'Permission not found.' });
        assignments.forEach(({ role }) => invalidateRole(role));
        await auditPermissionChange(req, 'updated', permission, before, permissionSnapshot(permission));
        return res.json({ message: 'Permission updated successfully.', permission });
    } catch (error) {
        if (error.code === 11000) return res.status(409).json({ error: 'A permission with this key already exists.' });
        return next(error);
    }
}

async function deletePermission(req, res, next) {
    try {
        const current = await Permission.findById(req.params.id);
        if (!current) return res.status(404).json({ error: 'Permission not found.' });
        if (current.isDeleted) return res.status(404).json({ error: 'Permission not found.' });
        const isSystemPermission = current.isSystem || registryByKey.has(current.key);

        const before = permissionSnapshot(current);
        const assignments = await RolePermission.find({ permission: current._id }).select('role');
        const permission = isSystemPermission
            ? await Permission.findByIdAndUpdate(
                current._id,
                { $set: { isDeleted: true } },
                { new: true, runValidators: true }
            )
            : await Permission.findByIdAndDelete(current._id);
        if (!permission) return res.status(404).json({ error: 'Permission not found.' });
        assignments.forEach(({ role }) => invalidateRole(role));
        if (!isSystemPermission) await RolePermission.deleteMany({ permission: current._id });
        await auditPermissionChange(req, 'deleted', permission, before, null);
        return res.json({
            message: isSystemPermission ? 'System permission removed.' : 'Permission deleted successfully.',
            permission: { id: String(permission._id), key: permission.key, isDeleted: isSystemPermission },
        });
    } catch (error) {
        return next(error);
    }
}

async function restorePermission(req, res, next) {
    try {
        const current = await Permission.findById(req.params.id);
        if (!current || !current.isDeleted || !(current.isSystem || registryByKey.has(current.key))) {
            return res.status(404).json({ error: 'Removed system permission not found.' });
        }
        const permission = await Permission.findByIdAndUpdate(
            current._id,
            { $set: { isDeleted: false, isSystem: true } },
            { new: true, runValidators: true }
        );
        if (!permission) return res.status(404).json({ error: 'Removed system permission not found.' });
        const assignments = await RolePermission.find({ permission: current._id }).select('role');
        assignments.forEach(({ role }) => invalidateRole(role));
        await auditPermissionChange(req, 'restored', permission, permissionSnapshot(current), permissionSnapshot(permission));
        return res.json({ message: 'System permission restored.', permission });
    } catch (error) {
        return next(error);
    }
}

module.exports = {
    getRoles,
    createRole,
    getRole,
    updateRole,
    deleteRole,
    replacePermissions,
    getPermissions,
    getGroupedPermissions,
    createPermission,
    updatePermission,
    deletePermission,
    restorePermission,
};