const yup = require('yup');
const { objectId } = require('./common');

const holdSeatSchema = yup.object({
    showtimeId: objectId,
    seatIds: yup.array().of(yup.string().trim()).required('Seat IDs are required.').min(1, 'Select at least one seat.').max(10, 'Select between 1 and 10 seats.'),
}).noUnknown(true);

const extendHoldSchema = yup.object({
    holdId: objectId,
}).noUnknown(true);

const releaseHoldSchema = yup.object({
    holdId: objectId,
}).noUnknown(true);

const holdIdSchema = yup.object({
    id: objectId,
}).noUnknown(true);

module.exports = {
    holdSeatSchema,
    extendHoldSchema,
    releaseHoldSchema,
    holdIdSchema,
};