const yup = require('yup');
const { objectId } = require('./common');

const snackCreateSchema = yup.object({
    catalogId: yup
        .string()
        .trim()
        .lowercase()
        .matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Use lowercase letters, numbers, and hyphens for the catalog ID.')
        .required('Catalog ID is required.'),
    name: yup
        .string()
        .trim()
        .required('Snack name is required.')
        .min(2, 'Snack name is too short.'),
    description: yup
        .string()
        .trim()
        .required('Description is required.')
        .max(500),
    type: yup
        .string()
        .oneOf(['concession', 'snack', 'drink', 'gummies'], 'Unsupported product type.')
        .required('Product type is required.'),
    category: yup
        .string()
        .oneOf(['popcorn', 'drink', 'candy', 'gummies', 'combo', 'other'], 'Unsupported snack category.')
        .required('Category is required.'),
    originalPrice: yup
        .number()
        .transform((value, originalValue) => (originalValue === '' ? null : value))
        .min(0, 'Original price cannot be negative.')
        .nullable()
        .optional(),
    isCombo: yup
        .boolean()
        .default(false),
    price: yup
        .number()
        .required('Price is required.')
        .min(0, 'Price cannot be negative.'),
    image: yup
        .string()
        .trim()
        .url('Image URL must be a valid URL.')
        .required('Image URL is required.'),
    available: yup
        .boolean()
        .default(true),
}).test('combo-original-price', 'A combo original price must be greater than its sale price.', (value) => (
    !value?.isCombo || Number(value.originalPrice) > Number(value.price)
)).noUnknown(true);

const snackUpdateSchema = yup.object({
    name: yup
        .string()
        .trim()
        .min(2, 'Snack name is too short.')
        .optional(),
    description: yup.string().trim().max(500).optional(),
    type: yup.string().oneOf(['concession', 'snack', 'drink', 'gummies']).optional(),
    category: yup
        .string()
        .oneOf(['popcorn', 'drink', 'candy', 'gummies', 'combo', 'other'], 'Unsupported snack category.')
        .optional(),
    price: yup.number().min(0, 'Price cannot be negative.').optional(),
    originalPrice: yup
        .number()
        .transform((value, originalValue) => (originalValue === '' ? null : value))
        .min(0, 'Original price cannot be negative.')
        .nullable()
        .optional(),
    isCombo: yup.boolean().optional(),
    image: yup
        .string()
        .trim()
        .url('Image URL must be a valid URL.')
        .nullable()
        .optional(),
    available: yup.boolean().optional(),
}).test('combo-original-price', 'A combo original price must be greater than its sale price.', (value) => (
    !value?.isCombo || (
        value.originalPrice != null &&
        Number(value.originalPrice) > Number(value.price)
    )
)).noUnknown(true);

const snackIdSchema = yup.object({
    id: objectId,
}).noUnknown(true);

module.exports = {
    snackCreateSchema,
    snackUpdateSchema,
    snackIdSchema,
};