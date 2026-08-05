const express = require('express');
const { optionalAuth } = require('../middleware/auth');
const { getShowtimeById } = require('../controllers/showtimes');
const {
  validateParams,
  showtime: { showtimeIdSchema },
} = require('../validations');

const router = express.Router();

router.get('/:id', optionalAuth, validateParams(showtimeIdSchema), getShowtimeById);

module.exports = router;