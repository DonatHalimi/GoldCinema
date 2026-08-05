const yup = require('yup');
const { objectId } = require('./common');

const screenCreateSchema = yup.object({
    cinema: objectId,
    name: yup
        .string()
        .trim()
        .required('Screen name is required.'),
    rows: yup
        .number()
        .required('Rows are required.')
        .min(1, 'Rows must be at least 1.'),
    columns: yup
        .number()
        .required('Columns are required.')
        .min(1, 'Columns must be at least 1.'),
    seats: yup
        .array()
        .of(objectId)
        .default([]),
}).noUnknown(true);

const screenUpdateSchema = yup.object({
    cinema: objectId.optional(),
    name: yup
        .string()
        .trim()
        .optional(),
    rows: yup
        .number()
        .min(1, 'Rows must be at least 1.')
        .optional(),
    columns: yup
        .number()
        .min(1, 'Columns must be at least 1.')
        .optional(),
    seats: yup
        .array()
        .of(objectId)
        .optional(),
}).noUnknown(true);

const screenIdSchema = yup.object({
    id: objectId,
}).noUnknown(true);

module.exports = {
    screenCreateSchema,
    screenUpdateSchema,
    screenIdSchema,
};