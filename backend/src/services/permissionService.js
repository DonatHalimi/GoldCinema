const Permission = require('../models/permission');
const RolePermission = require('../models/rolePermission');
const Role = require('../models/role');
const { registryByKey } = require('../config/permissionRegistry');

const CACHE_TTL_MS = 30 * 1000;
const cache = new Map();

function invalidateRole(roleId) {
    if (roleId) cache.delete(String(roleId));
}

async function resolveRolePermissions(roleId) {
    if (!roleId) return null;
    const id = String(roleId);
    const cached = cache.get(id);
    if (cached && cached.expiresAt > Date.now()) return cached.value;

    const role = await Role.findById(roleId).select('name isSystem isProtected unrestricted');
    if (!role) {
        cache.set(id, { value: null, expiresAt: Date.now() + CACHE_TTL_MS });
        return null;
    }
    if (role.unrestricted) {
        const result = { unrestricted: true, keys: new Set(['*']) };
        cache.set(id, { value: result, expiresAt: Date.now() + CACHE_TTL_MS });
        return result;
    }

    const assignments = await RolePermission.find({ role: roleId }).populate('permission', 'key isDeleted');
    const keys = new Set(
        assignments
            .filter((assignment) => !assignment.permission?.isDeleted)
            .map((assignment) => assignment.permission?.key)
            .filter(Boolean)
    );
    const result = { unrestricted: false, keys };
    cache.set(id, { value: result, expiresAt: Date.now() + CACHE_TTL_MS });
    return result;
}

function hasAnyPermission(permissionSet, permissions) {
    if (!permissionSet) return false;
    if (permissionSet.unrestricted) return true;
    return permissions.some((permission) => permissionSet.keys.has(permission));
}

function hasAllPermissions(permissionSet, permissions) {
    if (!permissionSet) return false;
    if (permissionSet.unrestricted) return true;
    return permissions.every((permission) => permissionSet.keys.has(permission));
}

async function seedPermissions() {
    for (const [key, resource, action, description, category] of require('../config/permissionRegistry').PERMISSION_REGISTRY) {
        await Permission.findOneAndUpdate(
            { key },
            { $setOnInsert: { key, resource, action, description, category, isSystem: true, isDeleted: false } },
            { upsert: true, new: true, setDefaultsOnInsert: true }
        );
    }
}

async function replaceRolePermissions(roleId, permissionKeys) {
    const uniqueKeys = [...new Set(permissionKeys)];
    const permissions = await Permission.find({ key: { $in: uniqueKeys }, isDeleted: { $ne: true } }).select('_id key isSystem');
    if (permissions.length !== uniqueKeys.length) {
        const error = new Error('One or more permissions have not been migrated.');
        error.status = 409;
        throw error;
    }
    const invalid = permissions.filter((permission) =>
        !/^[a-z][a-z0-9_-]*:[a-z][a-z0-9_-]*$/.test(permission.key) ||
        (permission.isSystem && !registryByKey.has(permission.key))
    );
    if (invalid.length) {
        const error = new Error(`Invalid permission(s): ${invalid.map(({ key }) => key).join(', ')}`);
        error.status = 400;
        throw error;
    }
    await RolePermission.deleteMany({ role: roleId });
    if (permissions.length) {
        await RolePermission.insertMany(
            permissions.map((permission) => ({ role: roleId, permission: permission._id })),
            { ordered: true }
        );
    }
    invalidateRole(roleId);
}

module.exports = {
    CACHE_TTL_MS,
    invalidateRole,
    resolveRolePermissions,
    hasAnyPermission,
    hasAllPermissions,
    seedPermissions,
    replaceRolePermissions,
};
