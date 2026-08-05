const yup = require('yup');
const { objectId } = require('./common');

const snackCreateSchema = yup.object({
    name: yup.string().trim().required('Snack name is required.').min(2, 'Snack name is too short.'),
    category: yup.string().oneOf(['popcorn', 'drink', 'candy', 'combo', 'other'], 'Unsupported snack category.').default('other'),
    price: yup.number().required('Price is required.').min(0, 'Price cannot be negative.'),
    image: yup.string().trim().url('Image URL must be a valid URL.').nullable().optional(),
    available: yup.boolean().default(true),
}).noUnknown(true);

const snackUpdateSchema = yup.object({
    name: yup.string().trim().min(2, 'Snack name is too short.').optional(),
    category: yup.string().oneOf(['popcorn', 'drink', 'candy', 'combo', 'other'], 'Unsupported snack category.').optional(),
    price: yup.number().min(0, 'Price cannot be negative.').optional(),
    image: yup.string().trim().url('Image URL must be a valid URL.').nullable().optional(),
    available: yup.boolean().optional(),
}).noUnknown(true);

const snackIdSchema = yup.object({
    id: objectId,
}).noUnknown(true);

module.exports = {
    snackCreateSchema,
    snackUpdateSchema,
    snackIdSchema,
};