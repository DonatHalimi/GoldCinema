const crypto = require('crypto');
const sanitizeHtml = require('sanitize-html');
const EmailTemplate = require('../models/emailTemplate');
const defaultTemplates = require('../db/emailTemplateDefaults.json');
const { PERMISSION_REGISTRY } = require('../config/permissionRegistry');
const { invalidateRole } = require('./permissionService');

const defaultsBySlug = new Map(defaultTemplates.map((template) => [template.slug, template]));
const templateTags = [
    'html', 'head', 'body', 'meta', 'title', 'div', 'span', 'p', 'a', 'img',
    'h1', 'h2', 'h3', 'h4', 'strong', 'b', 'em', 'i', 'br', 'hr',
    'ul', 'ol', 'li', 'table', 'thead', 'tbody', 'tfoot', 'tr', 'th', 'td',
];
const sanitizerOptions = {
    allowedTags: templateTags,
    allowedAttributes: {
        '*': ['class', 'data-gc-email-style'],
        a: ['href', 'target', 'rel', 'title'],
        img: ['src', 'alt', 'width', 'height', 'title'],
        meta: ['charset', 'name', 'content'],
    },
    allowedSchemes: ['http', 'https', 'mailto', 'cid'],
    allowedSchemesByTag: { img: ['http', 'https', 'cid'] },
    allowProtocolRelative: false,
    disallowedTagsMode: 'discard',
    parseStyleAttributes: false,
};
const safeFragmentOptions = {
    ...sanitizerOptions,
    allowedTags: ['a', 'b', 'br', 'code', 'div', 'em', 'h1', 'h2', 'h3', 'i', 'li', 'ol', 'p', 'span', 'strong', 'ul'],
    allowedAttributes: { a: ['href', 'title'], '*': [] },
};
const previewOnlyValues = {
    verificationUrl: 'https://example.test/verify?token=PREVIEW_ONLY',
    resetUrl: 'https://example.test/reset?token=PREVIEW_ONLY',
    code: '000000',
    qrImageSrc: 'cid:preview-qrcode@goldcinema',
};

class EmailTemplateError extends Error {
    constructor(message, status = 400) {
        super(message);
        this.name = 'EmailTemplateError';
        this.status = status;
    }
}

function getDefaultTemplate(slug) {
    return defaultsBySlug.get(String(slug));
}

function validateTemplateSource(template) {
    const variables = Array.isArray(template.variables) ? template.variables : [];
    const variableKeys = new Set(variables.map((variable) => variable.key));
    for (const [field, value] of [['subject', template.subject], ['htmlBody', template.htmlBody], ['textBody', template.textBody || '']]) {
        if (typeof value !== 'string') throw new EmailTemplateError(`${field} must be a string.`);
        const tokens = [...value.matchAll(/\{\{([\s\S]*?)\}\}/g)].map((match) => match[1].trim());
        let conditionalDepth = 0;
        for (const token of tokens) {
            if (token.startsWith('#if ')) {
                const key = token.slice(4).trim();
                if (!/^[a-z][A-Za-z0-9_]*$/.test(key) || !variableKeys.has(key)) {
                    throw new EmailTemplateError(`Unsupported template variable: ${key || token}.`);
                }
                if (conditionalDepth) throw new EmailTemplateError('Nested conditional blocks are not supported.');
                conditionalDepth = 1;
            } else if (token === '/if') {
                if (!conditionalDepth) throw new EmailTemplateError('Conditional block closing tag has no opening tag.');
                conditionalDepth = 0;
            } else if (!/^[a-z][A-Za-z0-9_]*$/.test(token) || !variableKeys.has(token)) {
                throw new EmailTemplateError(`Unsupported template variable: ${token}.`);
            }
        }
        if (conditionalDepth) throw new EmailTemplateError('Conditional block is missing its closing tag.');
        if (value.replace(/\{\{[\s\S]*?\}\}/g, '').includes('{{')) {
            throw new EmailTemplateError(`Malformed placeholder in ${field}.`);
        }
    }
}

function getTrustedStyles(slug) {
    const html = getDefaultTemplate(slug)?.htmlBody || '';
    return {
        blocks: [...html.matchAll(/<style\b[^>]*>[\s\S]*?<\/style>/gi)].map(([block]) => block),
        attributes: [...html.matchAll(/\sstyle=(["'])(.*?)\1/gi)].map(([, , value]) => value),
    };
}

function sanitizeTemplateHtml(value, slug) {
    const trustedStyles = getTrustedStyles(slug);
    const tokenPrefix = `gcemail${crypto.randomBytes(8).toString('hex')}`;
    const restorations = new Map();
    let tokenIndex = 0;
    let html = String(value || '').replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, (block) => {
        const index = trustedStyles.blocks.indexOf(block);
        if (index < 0) return '';
        const token = `${tokenPrefix}b${tokenIndex++}`;
        restorations.set(token, trustedStyles.blocks[index]);
        return token;
    });

    html = html.replace(/\sstyle=(["'])(.*?)\1/gi, (attribute, _quote, valueText) => {
        const index = trustedStyles.attributes.indexOf(valueText);
        if (index < 0) return '';
        const token = `${tokenPrefix}a${tokenIndex++}`;
        restorations.set(token, `style="${trustedStyles.attributes[index]}"`);
        return ` data-gc-email-style="${token}"`;
    });

    html = sanitizeHtml(html, sanitizerOptions);
    for (const [token, replacement] of restorations) {
        if (replacement.startsWith('<style')) {
            html = html.replace(token, replacement);
        } else {
            html = html.replace(`data-gc-email-style="${token}"`, replacement);
        }
    }
    return html;
}

function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, (character) => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;',
    })[character]);
}

function normalizeVariables(template, supplied = {}, { useSamples = false } = {}) {
    if (!supplied || typeof supplied !== 'object' || Array.isArray(supplied)) {
        throw new EmailTemplateError('Template variables must be an object.');
    }
    const supported = new Map(template.variables.map((variable) => [variable.key, variable]));
    const unsupported = Object.keys(supplied).filter((key) => !supported.has(key));
    if (unsupported.length) throw new EmailTemplateError(`Unsupported template variable(s): ${unsupported.join(', ')}.`);

    const values = {};
    for (const variable of template.variables) {
        let value = supplied[variable.key];
        if (value === undefined && useSamples) value = variable.sampleValue || previewOnlyValues[variable.key];
        if (value === undefined || value === null) value = '';
        if (variable.required && String(value).trim() === '') {
            throw new EmailTemplateError(`Required template variable "${variable.key}" is missing.`);
        }
        if (!['string', 'number', 'boolean'].includes(typeof value)) {
            throw new EmailTemplateError(`Template variable "${variable.key}" must be a string, number, or boolean.`);
        }
        if (String(value).length > 25000) throw new EmailTemplateError(`Template variable "${variable.key}" is too long.`);
        values[variable.key] = value;
    }
    return values;
}

function interpolate(source, values, variables, { html = false } = {}) {
    let output = source.replace(/\{\{#if ([a-z][A-Za-z0-9_]*)\}\}([\s\S]*?)\{\{\/if\}\}/g, (_match, key, content) =>
        values[key] ? content : ''
    );
    const types = new Map(variables.map((variable) => [variable.key, variable.type || 'text']));
    output = output.replace(/\{\{([a-z][A-Za-z0-9_]*)\}\}/g, (_match, key) => {
        const value = values[key] ?? '';
        if (html && types.get(key) === 'html') return sanitizeHtml(String(value), safeFragmentOptions);
        return html ? escapeHtml(value) : String(value);
    });
    return output;
}

function htmlToText(html) {
    return sanitizeHtml(html, { allowedTags: [], allowedAttributes: {} })
        .replace(/&nbsp;/g, ' ')
        .replace(/&#39;/g, "'")
        .replace(/&quot;/g, '"')
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/[ \t]+\n/g, '\n')
        .replace(/\n{3,}/g, '\n\n')
        .trim();
}

function renderTemplateContent(template, suppliedVariables, options = {}) {
    validateTemplateSource(template);
    const variables = normalizeVariables(template, suppliedVariables, options);
    const subject = interpolate(template.subject, variables, template.variables).replace(/[\r\n]+/g, ' ').trim();
    const unsanitizedHtml = interpolate(template.htmlBody, variables, template.variables, { html: true });
    const html = sanitizeTemplateHtml(unsanitizedHtml, template.slug);
    const text = template.textBody
        ? interpolate(template.textBody, variables, template.variables).trim()
        : htmlToText(html);
    return { subject, html, text, variables };
}

async function loadTemplate(slug) {
    const fallback = getDefaultTemplate(slug);
    let stored;
    try {
        stored = await EmailTemplate.findOne({ slug }).lean();
    } catch (error) {
        if (!fallback) throw error;
        console.error(`[email-template] Database lookup failed for ${slug}; using built-in default.`, error.message);
        return fallback;
    }
    if (!stored || stored.isDeleted || !stored.isActive) {
        if (fallback) return fallback;
        throw new EmailTemplateError(`Email template "${slug}" is not available.`, 404);
    }
    try {
        validateTemplateSource(stored);
        return stored;
    } catch (error) {
        if (!fallback) throw error;
        console.error(`[email-template] Invalid template ${slug}; using built-in default.`, error.message);
        return fallback;
    }
}

async function renderEmailTemplate(slug, variables = {}, options = {}) {
    const template = await loadTemplate(slug);
    return renderTemplateContent(template, variables, options);
}

async function seedDefaultEmailTemplates() {
    for (const template of defaultTemplates) {
        validateTemplateSource(template);
        await EmailTemplate.updateOne(
            { slug: template.slug },
            { $setOnInsert: template },
            { upsert: true }
        );
    }

    const permissionService = require('./permissionService');
    const Permission = require('../models/permission');
    const Role = require('../models/role');
    const RolePermission = require('../models/rolePermission');
    const emailPermissions = PERMISSION_REGISTRY.filter(([key]) => key.startsWith('email-templates:'));
    for (const [key, resource, action, description, category] of emailPermissions) {
        await Permission.findOneAndUpdate(
            { key },
            { $setOnInsert: { key, resource, action, description, category, isSystem: true } },
            { upsert: true, new: true, setDefaultsOnInsert: true }
        );
    }
    const adminRole = await Role.findOne({ name: 'admin' });
    if (adminRole) {
        const permissions = await Permission.find({
            key: { $in: emailPermissions.map(([key]) => key) },
            isDeleted: { $ne: true },
        }).select('_id');
        for (const permission of permissions) {
            await RolePermission.updateOne(
                { role: adminRole._id, permission: permission._id },
                { $setOnInsert: { role: adminRole._id, permission: permission._id } },
                { upsert: true }
            );
        }
        permissionService.invalidateRole(adminRole._id);
    }
}

module.exports = {
    EmailTemplateError,
    getDefaultTemplate,
    validateTemplateSource,
    normalizeVariables,
    sanitizeTemplateHtml,
    renderTemplateContent,
    renderEmailTemplate,
    seedDefaultEmailTemplates,
};
