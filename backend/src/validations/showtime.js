const yup = require('yup');
const { objectId } = require('./common');

const showtimeCreateSchema = yup.object({
    movie: objectId,
    cinema: objectId,
    screen: objectId,
    startTime: yup
        .date()
        .required('Start time is required.'),
    endTime: yup
        .date()
        .required('End time is required.'),
    seats: yup
        .array()
        .of(yup.object({
            seatId: yup.string().trim().required('Seat ID is required.'),
            status: yup.string().oneOf(['available', 'booked'], 'Seat status must be available or booked.').default('available'),
        }))
        .default([]),
}).noUnknown(true);

const showtimeUpdateSchema = yup.object({
    movie: objectId.optional(),
    cinema: objectId.optional(),
    screen: objectId.optional(),
    startTime: yup
        .date()
        .optional(),
    endTime: yup
        .date()
        .optional(),
    seats: yup
        .array()
        .of(yup.object({
            seatId: yup.string().trim().required('Seat ID is required.'),
            status: yup.string().oneOf(['available', 'booked'], 'Seat status must be available or booked.').default('available'),
        }))
        .optional(),
}).noUnknown(true);

const showtimeIdSchema = yup.object({
    id: objectId,
}).noUnknown(true);

module.exports = {
    showtimeCreateSchema,
    showtimeUpdateSchema,
    showtimeIdSchema,
};