const test = require('node:test');
const assert = require('node:assert/strict');
const Permission = require('../src/models/permission');
const RolePermission = require('../src/models/rolePermission');
const AuditLog = require('../src/models/auditLog');
const { updatePermission, deletePermission } = require('../src/controllers/roles');

const original = {
    findById: Permission.findById,
    exists: Permission.exists,
    findByIdAndUpdate: Permission.findByIdAndUpdate,
    findByIdAndDelete: Permission.findByIdAndDelete,
    roleFind: RolePermission.find,
    roleDeleteMany: RolePermission.deleteMany,
    auditCreate: AuditLog.create,
};

function response() {
    return {
        statusCode: 200,
        body: null,
        status(code) { this.statusCode = code; return this; },
        json(body) { this.body = body; return this; },
    };
}

function restoreMocks() {
    Permission.findById = original.findById;
    Permission.exists = original.exists;
    Permission.findByIdAndUpdate = original.findByIdAndUpdate;
    Permission.findByIdAndDelete = original.findByIdAndDelete;
    RolePermission.find = original.roleFind;
    RolePermission.deleteMany = original.roleDeleteMany;
    AuditLog.create = original.auditCreate;
}

test('custom permissions can be edited and audit records capture the change', async (t) => {
    t.after(restoreMocks);
    const permissionId = 'custom-permission-id';
    const roleId = 'assigned-role-id';
    const current = {
        _id: permissionId,
        key: 'tickets:export',
        resource: 'tickets',
        action: 'export',
        description: 'Export tickets',
        category: 'Operations',
        isSystem: false,
    };
    const auditEntries = [];

    Permission.findById = async () => current;
    Permission.exists = async () => false;
    RolePermission.find = () => ({ select: async () => [{ role: roleId }] });
    Permission.findByIdAndUpdate = async (_id, update) => ({ ...current, ...update.$set });
    AuditLog.create = async (entry) => { auditEntries.push(entry); };

    const req = {
        params: { id: permissionId },
        body: {
            key: 'tickets:download',
            resource: 'tickets',
            action: 'download',
            description: 'Download tickets',
            category: 'Operations',
        },
        user: { _id: 'admin-id', email: 'admin@example.test' },
        activeRole: { name: 'admin' },
        ip: '192.0.2.1',
        get: () => 'test-agent',
    };
    const result = response();
    await updatePermission(req, result, assert.fail);

    assert.equal(result.statusCode, 200);
    assert.equal(result.body.permission.key, 'tickets:download');
    assert.equal(auditEntries[0].action, 'permission_updated');
    assert.equal(auditEntries[0].changes.before.key, 'tickets:export');
    assert.equal(auditEntries[0].changes.after.key, 'tickets:download');
});

test('system permissions can edit metadata and can be removed and restored', async (t) => {
    t.after(restoreMocks);
    let systemPermission = {
        _id: 'system-permission-id',
        key: 'users:read',
        resource: 'users',
        action: 'read',
        description: 'Read users',
        category: 'Users',
        isSystem: true,
        isDeleted: false,
    };
    const auditEntries = [];
    Permission.findById = async () => systemPermission;
    Permission.exists = async () => false;
    Permission.findByIdAndUpdate = async (_id, update) => {
        systemPermission = { ...systemPermission, ...update.$set };
        return systemPermission;
    };
    RolePermission.find = () => ({ select: async () => [{ role: 'role-id' }] });
    RolePermission.deleteMany = async () => assert.fail('System assignments should be retained for restore.');
    AuditLog.create = async (entry) => { auditEntries.push(entry); };

    const req = {
        params: { id: systemPermission._id },
        body: {
            key: 'users:read',
            resource: 'users',
            action: 'read',
            description: 'Read user accounts',
            category: 'Accounts',
        },
        user: { _id: 'admin-id', email: 'admin@example.test' },
        activeRole: { name: 'admin' },
        ip: '192.0.2.1',
        get: () => 'test-agent',
    };
    const updateResponse = response();
    await updatePermission(req, updateResponse, assert.fail);
    assert.equal(updateResponse.statusCode, 200);
    assert.equal(updateResponse.body.permission.description, 'Read user accounts');
    assert.equal(updateResponse.body.permission.key, 'users:read');

    req.body.action = 'write';
    req.body.key = 'users:write';
    const keyUpdateResponse = response();
    await updatePermission(req, keyUpdateResponse, assert.fail);
    assert.equal(keyUpdateResponse.statusCode, 400);

    const deleteResponse = response();
    await deletePermission(req, deleteResponse, assert.fail);
    assert.equal(deleteResponse.statusCode, 200);
    assert.equal(systemPermission.isDeleted, true);

    const restoreResponse = response();
    const { restorePermission } = require('../src/controllers/roles');
    await restorePermission(req, restoreResponse, assert.fail);
    assert.equal(restoreResponse.statusCode, 200);
    assert.equal(systemPermission.isDeleted, false);
    assert.deepEqual(auditEntries.map((entry) => entry.action), [
        'permission_updated',
        'permission_deleted',
        'permission_restored',
    ]);
});

test('deleting a custom permission removes role assignments and is audited', async (t) => {
    t.after(restoreMocks);
    const permission = {
        _id: 'custom-permission-id',
        key: 'tickets:export',
        resource: 'tickets',
        action: 'export',
        description: 'Export tickets',
        category: 'Operations',
        isSystem: false,
    };
    const roleId = 'assigned-role-id';
    const auditEntries = [];
    let removedAssignments = null;

    Permission.findById = async () => permission;
    Permission.findByIdAndDelete = async () => permission;
    RolePermission.find = () => ({ select: async () => [{ role: roleId }] });
    RolePermission.deleteMany = async (filter) => { removedAssignments = filter; };
    AuditLog.create = async (entry) => { auditEntries.push(entry); };

    const req = {
        params: { id: permission._id },
        user: { _id: 'admin-id', email: 'admin@example.test' },
        activeRole: { name: 'admin' },
        ip: '192.0.2.1',
        get: () => 'test-agent',
    };
    const result = response();
    await deletePermission(req, result, assert.fail);

    assert.equal(result.statusCode, 200);
    assert.deepEqual(removedAssignments, { permission: permission._id });
    assert.equal(auditEntries[0].action, 'permission_deleted');
    assert.equal(auditEntries[0].changes.before.key, permission.key);
    assert.equal(auditEntries[0].changes.after, null);
});
