const assert = require('node:assert/strict');
const { test } = require('node:test');
const { adminUserCreateSchema } = require('../src/validations/user');

test('admin user creation applies safe account defaults and accepts profile fields', async () => {
    const value = await adminUserCreateSchema.validate({
        name: 'Cinema User',
        email: 'USER@example.com',
        password: 'secure-password',
        phoneNumber: '+355 123 456',
        avatar: '',
    });

    assert.equal(value.email, 'user@example.com');
    assert.equal(value.isActive, true);
    assert.deepEqual(value.roles, ['customer']);
    assert.equal(value.phoneNumber, '+355 123 456');
    assert.equal(value.avatar, null);
});

test('admin user creation requires a password and a valid role list', async () => {
    await assert.rejects(
        adminUserCreateSchema.validate({
            name: 'Cinema User',
            email: 'user@example.com',
        }),
        /Password is required/
    );
    await assert.rejects(
        adminUserCreateSchema.validate({
            name: 'Cinema User',
            email: 'user@example.com',
            password: 'secure-password',
            roles: [],
        }),
        /roles/
    );
});
