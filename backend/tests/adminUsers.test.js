const assert = require('node:assert/strict');
const { test } = require('node:test');
const User = require('../src/models/user');
const Role = require('../src/models/role');
const Staff = require('../src/models/staff');
const Cinema = require('../src/models/cinema');
const { createUser } = require('../src/controllers/adminUsers');

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

test('admin creation hashes credentials and assigns selected database roles', async () => {
    const originals = {
        userExists: User.exists,
        userCreate: User.create,
        roleFind: Role.find,
    };
    const customer = { _id: 'customer-id', name: 'customer', description: 'Customer' };
    const operations = { _id: 'operations-id', name: 'operations', description: 'Operations' };
    let created;
    try {
        User.exists = async () => false;
        Role.find = async () => [customer, operations];
        User.create = async (payload) => {
            created = payload;
            return { _id: 'new-user-id', ...payload };
        };
        const response = createResponse();

        await createUser({
            body: {
                name: 'New User',
                email: 'NEW@example.com',
                password: 'secure-password',
                roles: ['customer', 'operations'],
                phoneNumber: '+355 123',
                avatar: '/images/avatar.png',
                isActive: true,
            },
            activeRole: null,
        }, response, (error) => assert.ifError(error));

        assert.equal(response.statusCode, 201);
        assert.equal(created.email, 'new@example.com');
        assert.notEqual(created.passwordHash, 'secure-password');
        assert.deepEqual(created.authProviders, ['password']);
        assert.deepEqual(created.roles, ['customer-id', 'operations-id']);
        assert.equal(created.role, 'customer-id');
        assert.equal(created.phoneNumber, '+355 123');
        assert.equal(created.avatar, '/images/avatar.png');
    } finally {
        User.exists = originals.userExists;
        User.create = originals.userCreate;
        Role.find = originals.roleFind;
    }
});

test('admin creation cannot assign unrestricted roles without an unrestricted actor', async () => {
    const originals = {
        userExists: User.exists,
        userCreate: User.create,
        roleFind: Role.find,
    };
    try {
        User.exists = async () => false;
        Role.find = async () => [{ _id: 'super-admin-id', name: 'super_admin', unrestricted: true }];
        User.create = async () => assert.fail('An unrestricted role must not be assigned');
        const response = createResponse();

        await createUser({
            body: { name: 'New User', email: 'user@example.com', password: 'secure-password', roles: ['super_admin'] },
            activeRole: null,
        }, response, (error) => assert.ifError(error));

        assert.equal(response.statusCode, 403);
    } finally {
        User.exists = originals.userExists;
        User.create = originals.userCreate;
        Role.find = originals.roleFind;
    }
});

test('admin creation provisions linked staff and manager profiles using an available cinema', async () => {
    const originals = {
        userExists: User.exists,
        userCreate: User.create,
        roleFind: Role.find,
        staffCreate: Staff.create,
        cinemaFindOne: Cinema.findOne,
    };
    const createdProfiles = [];

    try {
        User.exists = async () => false;
        User.create = async (payload) => ({ _id: 'new-user-id', ...payload });
        Cinema.findOne = () => ({ sort: async () => ({ _id: 'cinema-id' }) });
        Staff.create = async (payload) => {
            createdProfiles.push(payload);
            return { _id: 'staff-id', ...payload };
        };

        for (const roleCase of [
            { name: 'staff', position: 'usher', employeePrefix: 'STF' },
            { name: 'cinema_manager', position: 'manager', employeePrefix: 'MGR' },
        ]) {
            Role.find = async () => roleCase.name === 'cinema_manager'
                ? [
                    { _id: 'staff-role-id', name: 'staff' },
                    { _id: 'cinema-manager-role-id', name: 'cinema_manager' },
                ]
                : [{ _id: 'staff-role-id', name: 'staff' }];
            const response = createResponse();

            await createUser({
                body: {
                    name: 'New Staff Member',
                    email: `${roleCase.name}@example.com`,
                    password: 'secure-password',
                    roles: [roleCase.name],
                },
                activeRole: null,
            }, response, (error) => assert.ifError(error));

            assert.equal(response.statusCode, 201);
            assert.equal(response.body.data.staffProfile.cinema, 'cinema-id');
            assert.equal(response.body.data.staffProfile.position, roleCase.position);
            assert.equal(response.body.data.staffProfile.employeeId, `${roleCase.employeePrefix}-NEW-USER-ID`);
            assert.equal(createdProfiles.at(-1).user, 'new-user-id');
        }
    } finally {
        User.exists = originals.userExists;
        User.create = originals.userCreate;
        Role.find = originals.roleFind;
        Staff.create = originals.staffCreate;
        Cinema.findOne = originals.cinemaFindOne;
    }
});

test('admin creation removes the user if the required staff profile cannot be created', async () => {
    const originals = {
        userExists: User.exists,
        userCreate: User.create,
        roleFind: Role.find,
        staffCreate: Staff.create,
        cinemaFindOne: Cinema.findOne,
    };
    let userDeleted = false;

    try {
        User.exists = async () => false;
        Role.find = async () => [{ _id: 'staff-role-id', name: 'staff' }];
        User.create = async (payload) => ({
            _id: 'new-user-id',
            ...payload,
            deleteOne: async () => { userDeleted = true; },
        });
        Cinema.findOne = () => ({ sort: async () => ({ _id: 'cinema-id' }) });
        Staff.create = async () => { throw new Error('staff write failed'); };

        const response = createResponse();
        let nextError;
        await createUser({
            body: { name: 'New Staff Member', email: 'staff@example.com', password: 'secure-password', roles: ['staff'] },
            activeRole: null,
        }, response, (error) => { nextError = error; });

        assert.equal(userDeleted, true);
        assert.equal(nextError?.message, 'staff write failed');
    } finally {
        User.exists = originals.userExists;
        User.create = originals.userCreate;
        Role.find = originals.roleFind;
        Staff.create = originals.staffCreate;
        Cinema.findOne = originals.cinemaFindOne;
    }
});
