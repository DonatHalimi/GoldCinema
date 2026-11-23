const assert = require('node:assert/strict');
const { test } = require('node:test');
const Permission = require('../src/models/permission');
const RolePermission = require('../src/models/rolePermission');
const Role = require('../src/models/role');
const { invalidateRole, replaceRolePermissions, resolveRolePermissions, seedPermissions } = require('../src/services/permissionService');
const { PERMISSION_REGISTRY } = require('../src/config/permissionRegistry');

test('role assignments accept persisted custom permissions', async () => {
    const originalFind = Permission.find;
    const originalDeleteMany = RolePermission.deleteMany;
    const originalInsertMany = RolePermission.insertMany;
    const assignments = [];

    try {
        Permission.find = () => ({
            select: (fields) => {
                assert.equal(fields, '_id key isSystem');
                return Promise.resolve([
                    { _id: 'permission-id', key: 'operations:manage', isSystem: false },
                ]);
            },
        });
        RolePermission.deleteMany = async ({ role }) => assert.equal(role, 'role-id');
        RolePermission.insertMany = async (documents) => assignments.push(...documents);

        await replaceRolePermissions('role-id', ['operations:manage']);

        assert.deepEqual(assignments, [
            { role: 'role-id', permission: 'permission-id' },
        ]);
    } finally {
        Permission.find = originalFind;
        RolePermission.deleteMany = originalDeleteMany;
        RolePermission.insertMany = originalInsertMany;
    }
});

test('role assignments reject unregistered system permissions', async () => {
    const originalFind = Permission.find;
    const originalDeleteMany = RolePermission.deleteMany;

    try {
        Permission.find = () => ({
            select: () => Promise.resolve([
                { _id: 'permission-id', key: 'operations:manage', isSystem: true },
            ]),
        });
        RolePermission.deleteMany = async () => {
            assert.fail('Invalid permissions must not replace existing assignments');
        };

        await assert.rejects(
            replaceRolePermissions('role-id', ['operations:manage']),
            { message: 'Invalid permission(s): operations:manage' }
        );
    } finally {
        Permission.find = originalFind;
        RolePermission.deleteMany = originalDeleteMany;
    }
});

test('permission seeding does not overwrite administrator changes', async () => {
    const originalFindOneAndUpdate = Permission.findOneAndUpdate;
    const operations = [];

    try {
        Permission.findOneAndUpdate = async (...args) => { operations.push(args); };
        await seedPermissions();
        assert.equal(operations.length, PERMISSION_REGISTRY.length);
        assert.ok(operations.every(([, update]) => update.$setOnInsert && !update.$set));
    } finally {
        Permission.findOneAndUpdate = originalFindOneAndUpdate;
    }
});

test('deleted permissions do not appear in resolved role access', async () => {
    const originalFindById = Role.findById;
    const originalRoleFind = RolePermission.find;
    const roleId = 'deleted-permission-cache-test-role';

    try {
        Role.findById = () => ({
            select: async () => ({ unrestricted: false }),
        });
        RolePermission.find = () => ({
            populate: async () => [
                { permission: { key: 'tickets:read', isDeleted: false } },
                { permission: { key: 'tickets:delete', isDeleted: true } },
            ],
        });
        const permissions = await resolveRolePermissions(roleId);
        assert.deepEqual([...permissions.keys], ['tickets:read']);
    } finally {
        invalidateRole(roleId);
        Role.findById = originalFindById;
        RolePermission.find = originalRoleFind;
    }
});
