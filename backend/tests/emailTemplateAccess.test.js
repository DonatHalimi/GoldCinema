const test = require('node:test');
const assert = require('node:assert/strict');
const requireEmailTemplateAdmin = require('../src/middleware/emailTemplateAdmin');

test('email-template access is limited to admin and super admin roles', () => {
    for (const role of ['admin', 'super_admin']) {
        let nextCalled = false;
        const response = { status() { assert.fail('authorized role was rejected'); } };
        requireEmailTemplateAdmin({ activeRole: { name: role } }, response, () => { nextCalled = true; });
        assert.equal(nextCalled, true);
    }

    let statusCode = null;
    let body = null;
    const response = {
        status(code) { statusCode = code; return this; },
        json(value) { body = value; return this; },
    };
    requireEmailTemplateAdmin({ activeRole: { name: 'staff' } }, response, assert.fail);
    assert.equal(statusCode, 403);
    assert.equal(body.code, 'EMAIL_TEMPLATE_ADMIN_REQUIRED');
});
