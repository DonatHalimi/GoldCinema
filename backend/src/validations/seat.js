const yup = require('yup');
const { objectId } = require('./common');

const seatCreateSchema = yup.object({
    number: yup
        .string()
        .trim()
        .required('Seat number is required.'),
    row: yup
        .string()
        .trim()
        .required('Seat row is required.'),
    column: yup
        .number()
        .required('Column is required.')
        .min(1, 'Column must be at least 1.'),
    type: yup
        .string()
        .oneOf(['standard', 'recliner', 'wheelchair', 'love-seat'], 'Unsupported seat type.')
        .default('standard'),
    status: yup
        .string()
        .oneOf(['active', 'maintenance'], 'Unsupported seat status.')
        .default('active'),
    screen: objectId,
}).noUnknown(true);

const seatUpdateSchema = yup.object({
    number: yup
        .string()
        .trim()
        .optional(),
    row: yup
        .string()
        .trim()
        .optional(),
    column: yup
        .number()
        .min(1, 'Column must be at least 1.')
        .optional(),
    type: yup
        .string()
        .oneOf(['standard', 'recliner', 'wheelchair', 'love-seat'], 'Unsupported seat type.')
        .optional(),
    status: yup
        .string()
        .oneOf(['active', 'maintenance'], 'Unsupported seat status.')
        .optional(),
    screen: objectId.optional(),
}).noUnknown(true);

const seatIdSchema = yup.object({
    id: objectId,
}).noUnknown(true);

module.exports = {
    seatCreateSchema,
    seatUpdateSchema,
    seatIdSchema,
};