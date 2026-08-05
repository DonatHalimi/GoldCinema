const yup = require('yup');
const { objectId } = require('./common');

const roleCreateSchema = yup.object({
    name: yup
        .string()
        .trim()
        .required('Role name is required.')
        .min(2, 'Role name is too short.'),
    description: yup
        .string()
        .trim()
        .max(250, 'Description is too long.')
        .optional(),
}).noUnknown(true);

const roleUpdateSchema = yup.object({
    name: yup
        .string()
        .trim()
        .min(2, 'Role name is too short.')
        .optional(),
    description: yup
        .string()
        .trim()
        .max(250, 'Description is too long.')
        .optional(),
}).noUnknown(true);

const roleIdSchema = yup.object({
    id: objectId,
}).noUnknown(true);

module.exports = {
    roleCreateSchema,
    roleUpdateSchema,
    roleIdSchema,
};