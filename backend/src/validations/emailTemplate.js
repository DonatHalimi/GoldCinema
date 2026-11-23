const yup = require('yup');

const slug = yup.string()
    .trim()
    .lowercase()
    .matches(/^[a-z][a-z0-9_-]{1,63}$/, 'Template key must be a lowercase identifier.')
    .required();

const variableSchema = yup.object({
    key: yup.string().matches(/^[a-z][A-Za-z0-9_]*$/).required(),
    description: yup.string().trim().required().max(300),
    required: yup.boolean().default(false),
    sampleValue: yup.string().max(1000).default(''),
    type: yup.string().oneOf(['text', 'url', 'html', 'number', 'boolean']).default('text'),
}).noUnknown(true);

function uniqueVariables(variables) {
    return new Set((variables || []).map((variable) => variable.key)).size === (variables || []).length;
}

const emailTemplateCreateSchema = yup.object({
    slug,
    name: yup.string().trim().required().max(120),
    description: yup.string().trim().max(500).default(''),
    subject: yup.string().trim().required().max(250),
    htmlBody: yup.string().required().max(100000),
    textBody: yup.string().max(50000).default(''),
    variables: yup.array().of(variableSchema).max(80).default([]).test('unique-keys', 'Template variable keys must be unique.', uniqueVariables),
}).noUnknown(true);

const emailTemplateUpdateSchema = yup.object({
    name: yup.string().trim().max(120),
    description: yup.string().trim().max(500),
    subject: yup.string().trim().max(250),
    htmlBody: yup.string().max(100000),
    textBody: yup.string().max(50000),
    isActive: yup.boolean(),
}).noUnknown(true).test('has-update', 'At least one template field is required.', (value) => Object.keys(value || {}).length > 0);

const emailTemplatePreviewSchema = yup.object({
    variables: yup.object().default({}),
    draft: yup.object({
        name: yup.string().trim().max(120),
        description: yup.string().trim().max(500),
        subject: yup.string().trim().max(250),
        htmlBody: yup.string().max(100000),
        textBody: yup.string().max(50000),
        isActive: yup.boolean(),
    }).noUnknown(true).default({}),
}).noUnknown(true);

const emailTemplateTestSchema = yup.object({
    to: yup.string().trim().lowercase().email().required().max(254),
    variables: yup.object().default({}),
}).noUnknown(true);

const emailTemplateParamsSchema = yup.object({
    identifier: yup.string().trim().matches(/^(?:[a-z][a-z0-9_-]{1,63}|[0-9a-fA-F]{24})$/).required(),
}).noUnknown(true);

module.exports = {
    emailTemplateCreateSchema,
    emailTemplateUpdateSchema,
    emailTemplatePreviewSchema,
    emailTemplateTestSchema,
    emailTemplateParamsSchema,
};
