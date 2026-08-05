const yup = require('yup');
const { objectId } = require('./common');

const cinemaCreateSchema = yup.object({
    name: yup.string().trim().required('Cinema name is required.').min(2, 'Cinema name is too short.'),
    location: yup.object({
        address: yup.string().trim().required('Address is required.'),
        city: yup.string().trim().required('City is required.'),
        state: yup.string().trim().optional(),
        country: yup.string().trim().required('Country is required.'),
        coordinates: yup.object({
            lat: yup.number().optional(),
            lng: yup.number().optional(),
        }).noUnknown(true).optional(),
    }).required('Location is required.').noUnknown(true),
    type: yup.array().of(yup.string().oneOf(['2D', '3D', 'IMAX', '4DX', 'ScreenX'], 'Unsupported cinema type.')).default(['2D']),
    features: yup.array().of(yup.string().trim()).default([]),
    screens: yup.array().of(objectId).default([]),
}).noUnknown(true);

const cinemaUpdateSchema = yup.object({
    name: yup.string().trim().min(2, 'Cinema name is too short.').optional(),
    location: yup.object({
        address: yup.string().trim().optional(),
        city: yup.string().trim().optional(),
        state: yup.string().trim().optional(),
        country: yup.string().trim().optional(),
        coordinates: yup.object({
            lat: yup.number().optional(),
            lng: yup.number().optional(),
        }).noUnknown(true).optional(),
    }).noUnknown(true).optional(),
    type: yup.array().of(yup.string().oneOf(['2D', '3D', 'IMAX', '4DX', 'ScreenX'], 'Unsupported cinema type.')).optional(),
    features: yup.array().of(yup.string().trim()).optional(),
    screens: yup.array().of(objectId).optional(),
}).noUnknown(true);

const cinemaIdSchema = yup.object({
    id: objectId,
}).noUnknown(true);

module.exports = {
    cinemaCreateSchema,
    cinemaUpdateSchema,
    cinemaIdSchema,
};