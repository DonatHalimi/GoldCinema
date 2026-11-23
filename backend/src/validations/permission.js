const yup = require('yup');

const permissionCreateSchema = yup.object({
    key: yup.string().trim().lowercase().optional(),
    resource: yup
        .string()
        .trim()
        .lowercase()
        .matches(/^[a-z][a-z0-9_-]*$/, 'Resource must be a lowercase identifier.')
        .required()
        .max(64),
    action: yup
        .string()
        .trim()
        .lowercase()
        .matches(/^[a-z][a-z0-9_-]*$/, 'Action must be a lowercase identifier.')
        .required()
        .max(64),
    description: yup.string().trim().required().max(500),
    category: yup.string().trim().required().max(80),
}).noUnknown(true);

const permissionParamsSchema = yup.object({
    id: yup.string().matches(/^[a-f\d]{24}$/i, 'Invalid permission ID.').required(),
}).noUnknown(true);

module.exports = {
    permissionCreateSchema,
    permissionUpdateSchema: permissionCreateSchema,
    permissionParamsSchema,
};
