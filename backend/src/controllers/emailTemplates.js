const mongoose = require('mongoose');
const AuditLog = require('../models/auditLog');
const EmailTemplate = require('../models/emailTemplate');
const {
    EmailTemplateError,
    getDefaultTemplate,
    renderTemplateContent,
    sanitizeTemplateHtml,
    validateTemplateSource,
} = require('../services/emailTemplateService');
const { sendTemplatedEmail } = require('../utils/mailer');

async function findTemplate(identifier, includeDeleted = false) {
    const filter = includeDeleted ? {} : { isDeleted: { $ne: true } };
    if (mongoose.Types.ObjectId.isValid(identifier)) {
        return EmailTemplate.findOne({ ...filter, _id: identifier }).lean();
    }
    return EmailTemplate.findOne({ ...filter, slug: identifier }).lean();
}

function responseData(template) {
    if (!template) return null;
    const data = typeof template.toObject === 'function' ? template.toObject() : { ...template };
    return data;
}

async function recordTemplateAudit(req, action, slug, metadata = {}) {
    await AuditLog.create({
        category: 'admin_mutation',
        action: `email_template_${action}`,
        actor: {
            userId: req.user._id,
            email: req.user.email || null,
            role: req.activeRole?.name || null,
            ip: req.ip,
            userAgent: req.get('user-agent') || null,
        },
        resource: { type: 'email_template', id: slug },
        metadata,
        expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
    });
}

async function listEmailTemplates(req, res, next) {
    try {
        const templates = await EmailTemplate.find()
            .select('-htmlBody -textBody')
            .sort({ isSystem: -1, name: 1 })
            .lean();
        return res.json({ success: true, data: templates });
    } catch (error) {
        return next(error);
    }
}

async function getEmailTemplate(req, res, next) {
    try {
        const template = await findTemplate(req.params.identifier);
        if (!template) return res.status(404).json({ success: false, error: 'Email template not found.' });
        return res.json({ success: true, data: responseData(template) });
    } catch (error) {
        return next(error);
    }
}

async function createEmailTemplate(req, res, next) {
    try {
        const input = {
            ...req.body,
            htmlBody: sanitizeTemplateHtml(req.body.htmlBody, req.body.slug),
            isSystem: false,
            revision: 1,
        };
        validateTemplateSource(input);
        const template = await EmailTemplate.create(input);
        await recordTemplateAudit(req, 'created', template.slug, { revision: template.revision });
        return res.status(201).json({ success: true, data: responseData(template) });
    } catch (error) {
        if (error.code === 11000) return res.status(409).json({ success: false, error: 'An email template with this key already exists.' });
        if (error instanceof EmailTemplateError) return res.status(error.status).json({ success: false, error: error.message });
        return next(error);
    }
}

async function updateEmailTemplate(req, res, next) {
    try {
        const current = await findTemplate(req.params.identifier);
        if (!current) return res.status(404).json({ success: false, error: 'Email template not found.' });
        const updates = { ...req.body };
        if (updates.htmlBody !== undefined) updates.htmlBody = sanitizeTemplateHtml(updates.htmlBody, current.slug);
        const candidate = { ...current, ...updates, revision: current.revision + 1 };
        validateTemplateSource(candidate);
        const template = await EmailTemplate.findByIdAndUpdate(
            current._id,
            { $set: { ...updates, revision: candidate.revision } },
            { new: true, runValidators: true }
        );
        await recordTemplateAudit(req, 'updated', current.slug, {
            revision: template.revision,
            fields: Object.keys(updates),
        });
        return res.json({ success: true, data: responseData(template) });
    } catch (error) {
        if (error instanceof EmailTemplateError) return res.status(error.status).json({ success: false, error: error.message });
        return next(error);
    }
}

async function deleteEmailTemplate(req, res, next) {
    try {
        const current = await findTemplate(req.params.identifier);
        if (!current) return res.status(404).json({ success: false, error: 'Email template not found.' });
        if (current.isSystem) {
            const removed = await EmailTemplate.findByIdAndUpdate(
                current._id,
                { $set: { isDeleted: true, isActive: false, revision: current.revision + 1 } },
                { new: true, runValidators: true }
            );
            if (!removed) return res.status(404).json({ success: false, error: 'Email template not found.' });
        } else {
            const deleted = await EmailTemplate.findByIdAndDelete(current._id);
            if (!deleted) return res.status(404).json({ success: false, error: 'Email template not found.' });
        }
        await recordTemplateAudit(req, 'deleted', current.slug, {
            revision: current.revision + 1,
            isSystem: current.isSystem,
        });
        return res.json({ success: true, message: 'Email template deleted.', data: { slug: current.slug } });
    } catch (error) {
        return next(error);
    }
}

async function previewEmailTemplate(req, res, next) {
    try {
        const current = await findTemplate(req.params.identifier);
        if (!current) return res.status(404).json({ success: false, error: 'Email template not found.' });
        const draft = req.body.draft || {};
        const candidate = {
            ...current,
            ...draft,
            htmlBody: sanitizeTemplateHtml(draft.htmlBody ?? current.htmlBody, current.slug),
        };
        validateTemplateSource(candidate);
        const rendered = renderTemplateContent(candidate, req.body.variables || {}, { useSamples: true });
        return res.json({ success: true, data: rendered });
    } catch (error) {
        if (error instanceof EmailTemplateError) return res.status(error.status).json({ success: false, error: error.message });
        return next(error);
    }
}

async function resetEmailTemplate(req, res, next) {
    try {
        const current = await findTemplate(req.params.identifier, true);
        if (!current) return res.status(404).json({ success: false, error: 'Email template not found.' });
        if (!current.isSystem) return res.status(409).json({ success: false, error: 'Only system templates can be reset.' });
        const defaults = getDefaultTemplate(current.slug);
        if (!defaults) return res.status(409).json({ success: false, error: 'No default content is available for this template.' });
        const template = await EmailTemplate.findByIdAndUpdate(
            current._id,
            { $set: { ...defaults, revision: current.revision + 1, isActive: true, isDeleted: false } },
            { new: true, runValidators: true }
        );
        await recordTemplateAudit(req, 'reset', current.slug, { revision: template.revision });
        return res.json({ success: true, data: responseData(template) });
    } catch (error) {
        return next(error);
    }
}

async function sendTestEmail(req, res, next) {
    try {
        const template = await findTemplate(req.params.identifier);
        if (!template) return res.status(404).json({ success: false, error: 'Email template not found.' });
        if (!template.isActive) return res.status(409).json({ success: false, error: 'Disabled templates cannot be test-sent.' });
        const recipient = String(req.body.to).trim().toLowerCase();
        if (!req.user.email || recipient !== String(req.user.email).trim().toLowerCase()) {
            return res.status(403).json({ success: false, error: 'Test emails can only be sent to your signed-in administrator email address.' });
        }
        await sendTemplatedEmail({
            slug: template.slug,
            to: recipient,
            variables: req.body.variables || {},
            useSamples: true,
        });
        await recordTemplateAudit(req, 'test_sent', template.slug, { recipient });
        return res.json({ success: true, message: 'Test email sent.' });
    } catch (error) {
        if (error instanceof EmailTemplateError) return res.status(error.status).json({ success: false, error: error.message });
        return next(error);
    }
}

module.exports = {
    listEmailTemplates,
    getEmailTemplate,
    createEmailTemplate,
    updateEmailTemplate,
    deleteEmailTemplate,
    previewEmailTemplate,
    resetEmailTemplate,
    sendTestEmail,
};
