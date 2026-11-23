const test = require('node:test');
const assert = require('node:assert/strict');
const { requireAdmin } = require('../src/middleware/auth');
const { hasPermission } = require('../src/middleware/roleAccess');

test('database-backed permission helper has no name-only fallback', () => {
    assert.equal(hasPermission({ name: 'admin' }, 'users:read'), false);
    assert.equal(hasPermission({ name: 'super_admin' }, 'users:read'), false);
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
