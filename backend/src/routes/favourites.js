const express = require('express');
const { body, query, validationResult } = require('express-validator');
const { requireAuth } = require('../middleware/auth');
const { toggleFavourite, getMyFavourites } = require('../controllers/favourites');

const router = express.Router();

// Using express-validator directly here rather than the validations/ module,
// consistent with seatAvailability.js and seatHold.js — the shared
// validations/ contract isn't something I have visibility into.
function handleValidation(req, res, next) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ error: errors.array()[0].msg });
    }
    next();
}

router.post(
    '/toggle',
    requireAuth,
    [
        body('itemType').isIn(['movie', 'cinema']).withMessage('itemType must be "movie" or "cinema".'),
        body('itemId').isMongoId().withMessage('itemId must be a valid ID.'),
    ],
    handleValidation,
    toggleFavourite
);

router.get(
    '/mine',
    requireAuth,
    [query('type').optional().isIn(['movie', 'cinema']).withMessage('type must be "movie" or "cinema".')],
    handleValidation,
    getMyFavourites
);

module.exports = router;