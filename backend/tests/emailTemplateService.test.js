const test = require('node:test');
const assert = require('node:assert/strict');
const EmailTemplate = require('../src/models/emailTemplate');
const Permission = require('../src/models/permission');
const Role = require('../src/models/role');
const RolePermission = require('../src/models/rolePermission');
const defaults = require('../src/db/emailTemplateDefaults.json');
const { PERMISSION_REGISTRY } = require('../src/config/permissionRegistry');
const originalFindOne = EmailTemplate.findOne;
const {
    EmailTemplateError,
    renderTemplateContent,
    renderEmailTemplate,
    sanitizeTemplateHtml,
    seedDefaultEmailTemplates,
    validateTemplateSource,
} = require('../src/services/emailTemplateService');

test('default templates validate, render sample data, and do not persist auth secrets', () => {
    for (const template of defaults) {
        validateTemplateSource(template);
        const rendered = renderTemplateContent(template, {}, { useSamples: true });
        assert.ok(rendered.subject);
        assert.ok(rendered.html);
        if (template.slug === 'ticket_confirmation' || template.slug === 'gift_card_delivery') {
            assert.match(rendered.html, /<style/);
            assert.match(rendered.html, /style=/);
        }
    }

    for (const key of ['verificationUrl', 'resetUrl', 'code']) {
        const variable = defaults.flatMap(({ variables }) => variables).find((item) => item.key === key);
        assert.equal(variable.sampleValue, undefined);
    }
});

test('missing or disabled system templates use the built-in fallback', async (t) => {
    t.after(() => { EmailTemplate.findOne = originalFindOne; });
    const variables = {
        name: 'Alex',
        verificationUrl: 'https://example.test/verify',
        currentYear: '2026',
    };

    EmailTemplate.findOne = () => ({ lean: async () => null });
    const missing = await renderEmailTemplate('email_verification', variables);
    assert.equal(missing.subject, 'Verify your GoldCinema account');

    EmailTemplate.findOne = () => ({ lean: async () => ({ slug: 'email_verification', isActive: false }) });
    const disabled = await renderEmailTemplate('email_verification', variables);
    assert.equal(disabled.subject, 'Verify your GoldCinema account');

    EmailTemplate.findOne = () => ({ lean: async () => ({ slug: 'email_verification', isActive: true, isDeleted: true }) });
    const removed = await renderEmailTemplate('email_verification', variables);
    assert.equal(removed.subject, 'Verify your GoldCinema account');
});

test('interpolation escapes untrusted HTML and rejects missing or unsupported values', () => {
    const template = {
        slug: 'custom_message',
        subject: 'Hello {{name}}',
        htmlBody: '<p>{{name}}</p>',
        textBody: 'Hello {{name}}',
        variables: [{ key: 'name', description: 'Recipient name', required: true }],
    };

    const rendered = renderTemplateContent(template, { name: '<img src=x onerror=alert(1)>' });
    assert.equal(rendered.html, '<p>&lt;img src=x onerror=alert(1)&gt;</p>');
    assert.throws(() => renderTemplateContent(template, { name: '' }), EmailTemplateError);
    assert.throws(() => renderTemplateContent(template, { name: 'Alex', unexpected: 'value' }), EmailTemplateError);
});

test('HTML sanitization removes scripts, event handlers, and unsafe URL schemes', () => {
    const sanitized = sanitizeTemplateHtml(
        '<p onclick="alert(1)">Safe</p><script>alert(1)</script><a href="javascript:alert(1)">link</a>',
        'custom_message'
    );
    assert.equal(sanitized, '<p>Safe</p><a>link</a>');
});

test('default seeding is idempotent and only initializes records once', async (t) => {
    const original = {
        updateTemplate: EmailTemplate.updateOne,
        permissionUpsert: Permission.findOneAndUpdate,
        permissionFind: Permission.find,
        roleFind: Role.findOne,
        rolePermissionUpsert: RolePermission.updateOne,
    };
    const templateWrites = [];
    const permissionWrites = [];
    const rolePermissionWrites = [];
    const permissionIds = PERMISSION_REGISTRY
        .filter(([key]) => key.startsWith('email-templates:'))
        .map(([key]) => ({ _id: key }));

    t.after(() => {
        EmailTemplate.updateOne = original.updateTemplate;
        Permission.findOneAndUpdate = original.permissionUpsert;
        Permission.find = original.permissionFind;
        Role.findOne = original.roleFind;
        RolePermission.updateOne = original.rolePermissionUpsert;
    });

    EmailTemplate.updateOne = async (...args) => { templateWrites.push(args); };
    Permission.findOneAndUpdate = async (...args) => { permissionWrites.push(args); };
    Permission.find = () => ({ select: async () => permissionIds });
    Role.findOne = async () => ({ _id: 'admin-role' });
    RolePermission.updateOne = async (...args) => { rolePermissionWrites.push(args); };

    await seedDefaultEmailTemplates();
    await seedDefaultEmailTemplates();

    assert.equal(templateWrites.length, defaults.length * 2);
    assert.ok(templateWrites.every(([, update]) => update.$setOnInsert));
    assert.equal(permissionWrites.length, permissionIds.length * 2);
    assert.ok(permissionWrites.every(([, update]) => update.$setOnInsert));
    assert.equal(rolePermissionWrites.length, permissionIds.length * 2);
    assert.ok(rolePermissionWrites.every(([, update]) => update.$setOnInsert));
});
