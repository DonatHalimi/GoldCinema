const assert = require('node:assert/strict');
const { test } = require('node:test');
const Role = require('../src/models/role');
const { updateRole, replacePermissions } = require('../src/controllers/roles');

function createResponse() {
    return {
        statusCode: 200,
        status(code) {
            this.statusCode = code;
            return this;
        },
        json(body) {
            this.body = body;
            return this;
        },
    };
}

test('protected roles reject metadata and permission edits', async () => {
    const originalFindById = Role.findById;
    try {
        Role.findById = async () => ({ _id: 'protected-role-id', isProtected: true, unrestricted: false });

        const updateResponse = createResponse();
        await updateRole({
            params: { id: 'protected-role-id' },
            body: { description: 'Changed description' },
        }, updateResponse, (error) => assert.ifError(error));
        assert.equal(updateResponse.statusCode, 409);

        const permissionsResponse = createResponse();
        await replacePermissions({
            params: { id: 'protected-role-id' },
            body: { permissionKeys: [] },
        }, permissionsResponse, (error) => assert.ifError(error));
        assert.equal(permissionsResponse.statusCode, 409);
    } finally {
        Role.findById = originalFindById;
    }
});
