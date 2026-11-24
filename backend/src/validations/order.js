const yup = require('yup');
const { objectId } = require('./common');

const orderCreateSchema = yup.object({
    movie: objectId,
    showtime: objectId,
    seats: yup
        .array()
        .of(yup.string().trim())
        .required('Seats are required.')
        .min(1, 'At least one seat is required.'),

    ticketAmount: yup
        .number()
        .optional()
        .min(0, 'Ticket amount cannot be negative.'),
    snackAmount: yup
        .number()
        .optional()
        .default(0),

    snacks: yup
        .array()
        .of(yup.object({
            snack: objectId,
            quantity: yup
                .number()
                .required('Snack quantity is required')
                .min(1, 'Snack quantity must be positive.'),
            unitPrice: yup
                .number()
                .required('Snack unit price is required')
                .min(0, 'Snack unit price cannot be negative.'),
        }))
        .default([]),

    totalAmount: yup
        .number()
        .optional()
        .min(0, 'Total amount cannot be negative.'),
    holdId: objectId
        .optional()
        .nullable(),
    holdExpiresAt: yup
        .date()
        .nullable()
        .optional(),
}).noUnknown(true);

const concessionSelectionSchema = yup.object({
    items: yup.array().of(yup.object({
        catalogId: yup.string().trim().required('A concession identifier is required.'),
        quantity: yup.number().integer().required().min(1).max(20),
    }).noUnknown(true)).required().max(25),
}).noUnknown(true);

const orderIdSchema = yup.object({
    id: objectId,
}).noUnknown(true);

module.exports = {
    orderCreateSchema,
    concessionSelectionSchema,
    orderIdSchema,
};