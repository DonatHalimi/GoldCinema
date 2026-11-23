const test = require('node:test');
const assert = require('node:assert/strict');
const mongoose = require('mongoose');
const AuditLog = require('../src/models/auditLog');
const EmailTemplate = require('../src/models/emailTemplate');
const mailer = require('../src/utils/mailer');

const originalFindOne = EmailTemplate.findOne;
const originalAuditCreate = AuditLog.create;
const originalSend = mailer.sendTemplatedEmail;

function response() {
    return {
        statusCode: 200,
        body: null,
        status(code) { this.statusCode = code; return this; },
        json(body) { this.body = body; return this; },
    };
}

test('test-email delivery is limited to the active template and signed-in administrator', async (t) => {
    let template = { _id: new mongoose.Types.ObjectId(), slug: 'login_alert', isActive: true };
    const sent = [];
    const audits = [];

    t.after(() => {
        EmailTemplate.findOne = originalFindOne;
        AuditLog.create = originalAuditCreate;
        mailer.sendTemplatedEmail = originalSend;
    });

    EmailTemplate.findOne = () => ({ lean: async () => template });
    AuditLog.create = async (entry) => { audits.push(entry); };
    mailer.sendTemplatedEmail = async (message) => { sent.push(message); };
    const { sendTestEmail } = require('../src/controllers/emailTemplates');

    const request = {
        params: { identifier: 'login_alert' },
        body: { to: 'other@example.test', variables: {} },
        user: { _id: new mongoose.Types.ObjectId(), email: 'admin@example.test' },
        activeRole: { name: 'admin' },
        ip: '192.0.2.2',
        get: () => 'test-agent',
    };

    let result = response();
    await sendTestEmail(request, result, assert.fail);
    assert.equal(result.statusCode, 403);
    assert.equal(sent.length, 0);

    request.body.to = 'admin@example.test';
    result = response();
    await sendTestEmail(request, result, assert.fail);
    assert.equal(result.statusCode, 200);
    assert.equal(sent.length, 1);
    assert.equal(sent[0].to, 'admin@example.test');
    assert.equal(audits.length, 1);

    template = { ...template, isActive: false };
    result = response();
    await sendTestEmail(request, result, assert.fail);
    assert.equal(result.statusCode, 409);
    assert.equal(sent.length, 1);
});

test('template CRUD and preview handlers validate and sanitize administrator edits', async (t) => {
    const original = {
        findOne: EmailTemplate.findOne,
        create: EmailTemplate.create,
        findByIdAndUpdate: EmailTemplate.findByIdAndUpdate,
        findByIdAndDelete: EmailTemplate.findByIdAndDelete,
        auditCreate: AuditLog.create,
    };
    const auditEntries = [];
    const current = {
        _id: new mongoose.Types.ObjectId(),
        slug: 'custom_notice',
        name: 'Custom notice',
        description: '',
        subject: 'Hello {{name}}',
        htmlBody: '<p>Hello {{name}}</p>',
        textBody: 'Hello {{name}}',
        variables: [{ key: 'name', description: 'Recipient name', required: true, sampleValue: 'Alex' }],
        isActive: true,
        isSystem: false,
        revision: 1,
    };
    let targetTemplate = current;
    t.after(() => {
        EmailTemplate.findOne = original.findOne;
        EmailTemplate.create = original.create;
        EmailTemplate.findByIdAndUpdate = original.findByIdAndUpdate;
        EmailTemplate.findByIdAndDelete = original.findByIdAndDelete;
        AuditLog.create = original.auditCreate;
    });

    EmailTemplate.findOne = () => ({ lean: async () => targetTemplate });
    EmailTemplate.create = async (input) => ({ ...input, _id: current._id });
    EmailTemplate.findByIdAndUpdate = async (_id, update) => {
        targetTemplate = { ...targetTemplate, ...update.$set };
        return targetTemplate;
    };
    EmailTemplate.findByIdAndDelete = async (id) => (
        String(id) === String(targetTemplate._id) ? targetTemplate : null
    );
    AuditLog.create = async (entry) => { auditEntries.push(entry); };
    const {
        createEmailTemplate,
        updateEmailTemplate,
        previewEmailTemplate,
        resetEmailTemplate,
        deleteEmailTemplate,
    } = require('../src/controllers/emailTemplates');
    const req = {
        user: { _id: new mongoose.Types.ObjectId(), email: 'admin@example.test' },
        activeRole: { name: 'admin' },
        ip: '192.0.2.3',
        get: () => 'test-agent',
    };

    const createResponse = response();
    req.body = { ...current, _id: undefined, slug: 'custom_notice', isSystem: true };
    await createEmailTemplate(req, createResponse, assert.fail);
    assert.equal(createResponse.statusCode, 201);
    assert.equal(createResponse.body.data.isSystem, false);

    const updateResponse = response();
    req.params = { identifier: 'custom_notice' };
    req.body = { subject: 'Updated: {{name}}' };
    await updateEmailTemplate(req, updateResponse, assert.fail);
    assert.equal(updateResponse.statusCode, 200);
    assert.equal(updateResponse.body.data.revision, 2);

    const previewResponse = response();
    req.body = {
        draft: { subject: 'Hello {{name}}', htmlBody: '<p>Hello {{name}}</p>' },
        variables: { name: '<script>unsafe</script>' },
    };
    await previewEmailTemplate(req, previewResponse, assert.fail);
    assert.equal(previewResponse.statusCode, 200);
    assert.match(previewResponse.body.data.html, /&lt;script&gt;unsafe&lt;\/script&gt;/);
    const defaults = require('../src/db/emailTemplateDefaults.json');
    const systemTemplate = {
        ...defaults.find((item) => item.slug === 'email_verification'),
        _id: new mongoose.Types.ObjectId(),
        isActive: false,
        revision: 3,
    };
    targetTemplate = systemTemplate;
    const resetResponse = response();
    req.params.identifier = systemTemplate.slug;
    await resetEmailTemplate(req, resetResponse, assert.fail);
    assert.equal(resetResponse.statusCode, 200);
    assert.equal(resetResponse.body.data.revision, 4);
    assert.equal(resetResponse.body.data.isActive, true);
    assert.equal(resetResponse.body.data.subject, systemTemplate.subject);
    const deleteSystemResponse = response();
    req.params.identifier = systemTemplate.slug;
    await deleteEmailTemplate(req, deleteSystemResponse, assert.fail);
    assert.equal(deleteSystemResponse.statusCode, 200);
    assert.equal(deleteSystemResponse.body.data.slug, systemTemplate.slug);
    assert.equal(targetTemplate.isDeleted, true);
    assert.equal(targetTemplate.isActive, false);

    const restoreSystemResponse = response();
    await resetEmailTemplate(req, restoreSystemResponse, assert.fail);
    assert.equal(restoreSystemResponse.statusCode, 200);
    assert.equal(restoreSystemResponse.body.data.isDeleted, false);
    assert.equal(restoreSystemResponse.body.data.isActive, true);

    targetTemplate = current;
    const deleteCustomResponse = response();
    req.params.identifier = current.slug;
    await deleteEmailTemplate(req, deleteCustomResponse, assert.fail);
    assert.equal(deleteCustomResponse.statusCode, 200);
    assert.equal(deleteCustomResponse.body.data.slug, current.slug);
    assert.equal(auditEntries.length, 6);
    assert.equal(auditEntries[3].action, 'email_template_deleted');
    assert.equal(auditEntries[4].action, 'email_template_reset');
    assert.equal(auditEntries[5].action, 'email_template_deleted');
    assert.ok(auditEntries.every((entry) => entry.metadata));
});
