const express = require('express');
const { requireAuth, requireVerified } = require('../middleware/auth');
const {
    holdSeat,
    extendHold,
    releaseHold,
    getHoldById,
} = require('../controllers/seatHold');
const {
    validateBody,
    validateParams,
    seatHold: { holdSeatSchema, extendHoldSchema, releaseHoldSchema, holdIdSchema },
} = require('../validations');

const router = express.Router();

router.post(
    '/hold-seat',
    requireAuth,
    requireVerified,
    validateBody(holdSeatSchema),
    holdSeat
);

router.post(
    '/extend-hold',
    requireAuth,
    requireVerified,
    validateBody(extendHoldSchema),
    extendHold
);

router.post('/release-hold', requireAuth, validateBody(releaseHoldSchema), releaseHold);
router.get('/holds/:id', requireAuth, validateParams(holdIdSchema), getHoldById);

module.exports = router;