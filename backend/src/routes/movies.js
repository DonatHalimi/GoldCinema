const express = require('express');
const {
  getMovies,
  getMovieById,
  getMovieShowtimes,
} = require('../controllers/movies');
const {
  validateParams,
  movie: { movieIdSchema },
} = require('../validations');

const router = express.Router();

router.get('/', getMovies);
router.get('/:id', validateParams(movieIdSchema), getMovieById);
router.get('/:id/showtimes', validateParams(movieIdSchema), getMovieShowtimes);

module.exports = router;