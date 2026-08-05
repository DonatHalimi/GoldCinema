const yup = require('yup');
const { objectId } = require('./common');

const movieCreateSchema = yup.object({
    title: yup.string().trim().required('Title is required.').min(2, 'Title is too short.'),
    slug: yup.string().trim().required('Slug is required.').matches(/^[a-z0-9-]+$/, 'Slug can only contain lowercase letters, numbers, and dashes.'),
    genres: yup.array().of(yup.string().trim()).default([]),
    duration: yup.number().required('Duration is required.').positive('Duration must be positive.'),
    description: yup.string().trim().required('Description is required.'),
    posterUrl: yup.string().trim().required('Poster URL is required.').url('Poster URL must be a valid URL.'),
    trailerUrl: yup.string().trim().url('Trailer URL must be a valid URL.').nullable().optional(),
    rating: yup.string().oneOf(['G', 'PG', 'PG-13', 'R', 'NC-17'], 'Unsupported rating.').required('Rating is required.'),
    releaseDate: yup.date().nullable().optional(),
    price: yup.number().required('Price is required.').min(0, 'Price cannot be negative.'),
    active: yup.boolean().default(true),
}).noUnknown(true);

const movieUpdateSchema = yup.object({
    title: yup.string().trim().min(2, 'Title is too short.').optional(),
    slug: yup.string().trim().matches(/^[a-z0-9-]+$/, 'Slug can only contain lowercase letters, numbers, and dashes.').optional(),
    genres: yup.array().of(yup.string().trim()).optional(),
    duration: yup.number().positive('Duration must be positive.').optional(),
    description: yup.string().trim().optional(),
    posterUrl: yup.string().trim().url('Poster URL must be a valid URL.').optional(),
    trailerUrl: yup.string().trim().url('Trailer URL must be a valid URL.').nullable().optional(),
    rating: yup.string().oneOf(['G', 'PG', 'PG-13', 'R', 'NC-17'], 'Unsupported rating.').optional(),
    releaseDate: yup.date().nullable().optional(),
    price: yup.number().min(0, 'Price cannot be negative.').optional(),
    active: yup.boolean().optional(),
}).noUnknown(true);

const movieIdSchema = yup.object({
    id: objectId,
}).noUnknown(true);

module.exports = {
    movieCreateSchema,
    movieUpdateSchema,
    movieIdSchema,
};