const express = require('express');
const Movie = require('../models/Movie');
const Showtime = require('../models/Showtime');
const { getAvailability } = require('../utils/seatAvailability');

const router = express.Router();

router.get('/', async (req, res, next) => {
  try {
    const movies = await Movie.find({ active: true }).sort({ title: 1 });
    res.json({ movies });
  } catch (err) {
    next(err);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const movie = await Movie.findById(req.params.id);
    if (!movie) return res.status(404).json({ error: 'Movie not found.' });
    res.json({ movie });
  } catch (err) {
    next(err);
  }
});

router.get('/:id/showtimes', async (req, res, next) => {
  try {
    const movie = await Movie.findById(req.params.id);
    if (!movie) return res.status(404).json({ error: 'Movie not found.' });

    const showtimes = await Showtime.find({ movie: movie._id, startTime: { $gte: startOfToday() } })
      .populate('cinema', 'name')
      .populate('screen', 'name')
      .sort({ startTime: 1 });

    const withCounts = await Promise.all(
      showtimes.map(async (s) => {
        const availability = await getAvailability(s);
        const available = [...availability.values()].filter((status) => status === 'available').length;
        return {
          id: s._id,
          movieId: s.movie,
          cinema: s.cinema,
          date: s.startTime.toISOString().slice(0, 10),
          time: s.startTime.toISOString().slice(11, 16),
          startTime: s.startTime,
          hall: s.screen?.name,
          seatsAvailable: available,
          seatsTotal: s.seats.length,
        };
      })
    );

    res.json({ showtimes: withCounts });
  } catch (err) {
    next(err);
  }
});

function startOfToday() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

module.exports = router;