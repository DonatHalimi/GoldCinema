const { body, validationResult } = require('express-validator');
const Showtime = require('../models/showtime');
const Movie = require('../models/movie');
const SeatHold = require('../models/seatHold');
const { getAvailability } = require('../utils/seatAvailability');

const HOLD_DURATION_MS = 5 * 60 * 1000;
const EXTENSION_MS = 5 * 60 * 1000;
const MAX_EXTENSIONS = 3;

function serializeHold(hold) {
    return {
        id: hold._id,
        userId: hold.user,
        showtimeId: hold.showtime,
        seats: hold.seats,
        expiresAt: hold.expiresAt,
        extensions: hold.extensions,
        extensionsRemaining: Math.max(0, MAX_EXTENSIONS - hold.extensions),
    };
}

async function holdSeat(req, res, next) {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ error: errors.array()[0].msg });
        }

        const { showtimeId, seatIds } = req.body;
        const requestedSeats = [...new Set(seatIds)];

        const showtime = await Showtime.findById(showtimeId);
        if (!showtime) return res.status(404).json({ error: 'Showtime not found.' });

        const movie = await Movie.findById(showtime.movie);
        if (!movie) return res.status(404).json({ error: 'Movie not found.' });

        const existingHold = await SeatHold.findOne({
            user: req.user.id,
            showtime: showtimeId,
            expiresAt: { $gt: new Date() },
        });

        const statusMap = await getAvailability(showtime);

        const invalidSeats = requestedSeats.filter((seatId) => !statusMap.has(seatId));
        if (invalidSeats.length) {
            return res.status(400).json({ error: `Unknown seats: ${invalidSeats.join(', ')}` });
        }

        const conflicts = requestedSeats.filter((seatId) => {
            const status = statusMap.get(seatId);
            if (status === 'available') return false;
            if (status === 'held' && existingHold?.seats.includes(seatId)) return false;
            return true;
        });

        if (conflicts.length) {
            return res.status(409).json({
                error: `These seats are no longer available: ${conflicts.join(', ')}`,
            });
        }

        const expiresAt = new Date(Date.now() + HOLD_DURATION_MS);

        let hold;
        if (existingHold) {
            existingHold.seats = requestedSeats;
            existingHold.expiresAt = expiresAt;
            existingHold.extensions = 0;
            hold = await existingHold.save();
        } else {
            hold = await SeatHold.create({
                user: req.user.id,
                showtime: showtimeId,
                seats: requestedSeats,
                expiresAt,
            });
        }

        const amount = Number((movie.price * requestedSeats.length).toFixed(2));

        res.status(201).json({
            hold: serializeHold(hold),
            amount,
            currency: 'USD',
            movie: { id: movie._id, title: movie.title, poster: movie.posterUrl },
            showtime: { id: showtime._id, startTime: showtime.startTime },
        });
    } catch (err) {
        next(err);
    }
}

async function extendHold(req, res, next) {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ error: errors.array()[0].msg });
        }

        const hold = await SeatHold.findById(req.body.holdId);

        if (!hold || hold.user.toString() !== req.user.id) {
            return res.status(404).json({ error: 'Hold not found.' });
        }

        if (hold.expiresAt < new Date()) {
            return res.status(410).json({
                error: 'This hold has already expired. Please select your seats again.',
            });
        }

        if (hold.extensions >= MAX_EXTENSIONS) {
            return res.status(409).json({
                error: `You've reached the maximum of ${MAX_EXTENSIONS} extensions for this hold.`,
            });
        }

        hold.expiresAt = new Date(hold.expiresAt.getTime() + EXTENSION_MS);
        hold.extensions += 1;
        await hold.save();

        res.json({ hold: serializeHold(hold) });
    } catch (err) {
        next(err);
    }
}

async function releaseHold(req, res, next) {
    try {
        const { holdId } = req.body;
        const hold = await SeatHold.findById(holdId);

        if (!hold || hold.user.toString() !== req.user.id) {
            return res.status(404).json({ error: 'Hold not found.' });
        }

        await hold.deleteOne();
        res.json({ released: true });
    } catch (err) {
        next(err);
    }
}

async function getHoldById(req, res, next) {
    try {
        const hold = await SeatHold.findById(req.params.id);

        if (!hold || hold.user.toString() !== req.user.id) {
            return res.status(404).json({ error: 'Hold not found.' });
        }

        const [movie, showtime] = await Promise.all([
            Showtime.findById(hold.showtime).then((s) => (s ? Movie.findById(s.movie) : null)),
            Showtime.findById(hold.showtime),
        ]);

        const expired = hold.expiresAt < new Date();
        const amount = movie ? Number((movie.price * hold.seats.length).toFixed(2)) : null;

        res.json({
            hold: serializeHold(hold),
            expired,
            amount,
            currency: 'USD',
            movie,
            showtime,
        });
    } catch (err) {
        next(err);
    }
}

module.exports = {
    holdSeat,
    extendHold,
    releaseHold,
    getHoldById,
};