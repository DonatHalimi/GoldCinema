const yup = require('yup');
const { objectId } = require('./common');

const userCreateSchema = yup.object({
    name: yup
        .string()
        .trim()
        .required('Name is required.')
        .min(2, 'Name is too short.'),
    email: yup
        .string()
        .trim()
        .required('Email is required.')
        .email('A valid email is required.'),
    passwordHash: yup
        .string()
        .trim()
        .required('Password hash is required.'),
    role: objectId.optional().nullable(),
    emailVerified: yup
        .boolean()
        .default(false),
    verificationToken: yup
        .string()
        .trim()
        .nullable()
        .optional(),
    verificationTokenExpiresAt: yup
        .date()
        .nullable()
        .optional(),
    refreshTokens: yup
        .array().of(yup.object({
            token: yup
                .string()
                .trim()
                .required('Refresh token is required.'),
            expiresAt: yup
                .date()
                .required('Refresh token expiry is required.'),
            createdAt: yup
                .date()
                .optional(),
        })).default([]),
    orderHistory: yup
        .array().of(objectId).default([]),
    totalSpent: yup
        .number().min(0, 'Total spent cannot be negative.').default(0),
}).noUnknown(true);

const userUpdateSchema = yup.object({
    name: yup
        .string()
        .trim()
        .min(2, 'Name is too short.')
        .optional(),
    email: yup
        .string()
        .trim()
        .email('A valid email is required.')
        .optional(),
    passwordHash: yup
        .string()
        .trim()
        .optional(),
    role: objectId.optional().nullable(),
    emailVerified: yup
        .boolean()
        .optional(),
    verificationToken: yup
        .string()
        .trim()
        .nullable()
        .optional(),
    verificationTokenExpiresAt: yup
        .date()
        .nullable()
        .optional(),
    refreshTokens: yup
        .array()
        .of(yup.object({
            token: yup
                .string()
                .trim()
                .required('Refresh token is required.'),
            expiresAt: yup
                .date()
                .required('Refresh token expiry is required.'),
            createdAt: yup
                .date()
                .optional(),
        }))
        .optional(),
    orderHistory: yup
        .array()
        .of(objectId)
        .optional(),
    totalSpent: yup
        .number()
        .min(0, 'Total spent cannot be negative.')
        .optional(),
}).noUnknown(true);

const userIdSchema = yup.object({
    id: objectId,
}).noUnknown(true);

module.exports = {
    userCreateSchema,
    userUpdateSchema,
    userIdSchema,
};