const yup = require('yup');
const { objectId } = require('./common');

const translationKeyCreateSchema = yup.object({
    namespace: yup.string().trim().required('Namespace is required.').min(2),
    key: yup.string().trim().required('Key is required.'),
    values: yup.object({
        en: yup.string().trim().required('English value is required.'),
        sq: yup.string().trim().nullable().optional(),
        'sr-Latn': yup.string().trim().nullable().optional(),
    }).required().noUnknown(true),
    context: yup.string().trim().nullable().optional(),
}).noUnknown(true);

const translationKeyUpdateSchema = yup.object({
    namespace: yup.string().trim().min(2).optional(),
    key: yup.string().trim().optional(),
    values: yup.object({
        en: yup.string().trim().optional(),
        sq: yup.string().trim().nullable().optional(),
        'sr-Latn': yup.string().trim().nullable().optional(),
    }).noUnknown(true).optional(),
    context: yup.string().trim().nullable().optional(),
}).noUnknown(true);

const translationKeyIdSchema = yup.object({ id: objectId }).noUnknown(true);

const i18nParamsSchema = yup.object({
    locale: yup.string().oneOf(['en', 'sq', 'sr-Latn'], 'Unsupported locale.').required(),
    namespace: yup.string().trim().required(),
}).noUnknown(true);

module.exports = {
    translationKeyCreateSchema,
    translationKeyUpdateSchema,
    translationKeyIdSchema,
    i18nParamsSchema,
};