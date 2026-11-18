const test = require('node:test');
const assert = require('node:assert/strict');
const { requireAdmin } = require('../src/middleware/auth');
const { hasPermission } = require('../src/middleware/roleAccess');

test('admin roles can read the users table', () => {
    assert.equal(hasPermission({ name: 'admin' }, 'users:read'), true);
    assert.equal(hasPermission({ name: 'super_admin' }, 'users:read'), true);
});

test('cinema managers are limited to staff and shift permissions', () => {
    assert.equal(hasPermission({ name: 'cinema_manager' }, 'staff:read'), true);
    assert.equal(hasPermission({ name: 'cinema_manager' }, 'staff:manage'), true);
    assert.equal(hasPermission({ name: 'cinema_manager' }, 'shifts:read'), true);
    assert.equal(hasPermission({ name: 'cinema_manager' }, 'shifts:manage'), true);
    assert.equal(hasPermission({ name: 'cinema_manager' }, 'admin:access'), false);
    assert.equal(hasPermission({ name: 'cinema_manager' }, 'users:read'), false);
});

test('requireAdmin accepts a role stored as a name or populated role', () => {
    for (const activeRole of ['admin', { name: 'admin' }]) {
        let passed = false;
        requireAdmin(
            { activeRole },
            { status() { return this; }, json() { throw new Error('Unexpected denial'); } },
            () => { passed = true; }
        );
        assert.equal(passed, true);
    }

    let responseStatus;
    requireAdmin(
        { activeRole: { name: 'cinema_manager' } },
        { status(code) { responseStatus = code; return this; }, json() {} },
        () => assert.fail('Cinema managers must not pass the admin guard')
    );
    assert.equal(responseStatus, 403);
});
