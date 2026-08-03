const express = require('express');
const Showtime = require('../models/showtime');
const Movie = require('../models/movie');
const Order = require('../models/order');
const SeatHold = require('../models/seatHold');
const { body, validationResult } = require('express-validator');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

const HOLD_DURATION_MS = 5 * 60 * 1000;

async function releaseExpiredHolds() {
    const now = new Date();

    await SeatHold.deleteMany({
        expiresAt: { $lt: now },
    });

    await Order.updateMany(
        {
            status: 'pending',
            holdExpiresAt: { $lt: now },
        },
        {
            $set: {
                status: 'expired',
            },
        }
    );
}

router.post(
    '/',
    requireAuth,
    [
        body('showtimeId').notEmpty().withMessage('showtimeId is required.'),
        body('seatIds').isArray({ min: 1 }).withMessage('At least one seat must be selected.'),
    ],
    async (req, res, next) => {
        try {
            const errors = validationResult(req);

            if (!errors.isEmpty()) {
                return res.status(400).json({
                    error: errors.array()[0].msg,
                });
            }

            await releaseExpiredHolds();

            const { showtimeId, seatIds } = req.body;

            const showtime = await Showtime.findById(showtimeId)
                .populate('movie');

            if (!showtime) {
                return res.status(404).json({
                    error: 'Showtime not found',
                });
            }

            const movie = showtime.movie;

            if (!movie) {
                return res.status(404).json({
                    error: 'Movie not found',
                });
            }

            const uniqueSeatIds = [...new Set(seatIds)];

            const seatObjs = uniqueSeatIds.map((seatId) =>
                showtime.seats.find((s) => s.seatId === seatId)
            );

            const missing = uniqueSeatIds.filter((_, i) => !seatObjs[i]);

            if (missing.length) {
                return res.status(400).json({
                    error: `Unknown seats: ${missing.join(', ')}`,
                });
            }

            const unavailable = seatObjs.filter(
                (s) => s.status !== 'available'
            );

            if (unavailable.length) {
                return res.status(409).json({
                    error: `These seats are no longer available`,
                });
            }

            const expiresAt = new Date(
                Date.now() + HOLD_DURATION_MS
            );

            const hold = await SeatHold.create({
                user: req.user.id,
                showtime: showtime._id,
                seats: uniqueSeatIds,
                expiresAt,
            });

            const amount = Number(
                (movie.price * uniqueSeatIds.length).toFixed(2)
            );

            const order = await Order.create({
                user: req.user.id,
                movie: movie._id,
                showtime: showtime._id,
                seats: uniqueSeatIds,
                amount,
                paymentStatus: 'pending',
                hold: hold._id,
            });

            res.status(201).json({
                order,
                movie: {
                    title: movie.title,
                    poster: movie.posterUrl,
                },
                showtime: {
                    startTime: showtime.startTime,
                },
                expiresAt,
            });

        } catch (err) {
            next(err);
        }
    }
);

router.get('/mine', requireAuth, async (req, res, next) => {
    try {
        await releaseExpiredHolds();

        const orders = await Order.find({
            user: req.user.id,
        })
            .populate('movie')
            .populate('showtime')
            .sort({
                createdAt: -1,
            });

        const enriched = orders.map((order) => ({
            ...order.toObject(),
            movie: order.movie
                ? {
                    title: order.movie.title,
                    poster: order.movie.posterUrl,
                }
                : null,
            showtime: order.showtime
                ? {
                    startTime: order.showtime.startTime,
                    endTime: order.showtime.endTime,
                }
                : null,
        }));

        res.json({
            orders: enriched,
        });
    } catch (err) {
        next(err);
    }
});

router.get('/:id', requireAuth, async (req, res, next) => {
    try {
        await releaseExpiredHolds();

        const order = await Order.findById(req.params.id)
            .populate('movie')
            .populate('showtime');

        if (!order || order.user.toString() !== req.user.id) {
            return res.status(404).json({
                error: 'Order not found',
            });
        }

        res.json({
            order: {
                ...order.toObject(),
                movie: order.movie
                    ? {
                        title: order.movie.title,
                        poster: order.movie.posterUrl,
                    }
                    : null,
                showtime: order.showtime
                    ? {
                        startTime: order.showtime.startTime,
                        endTime: order.showtime.endTime,
                    }
                    : null,
            },
        });
    } catch (err) {
        next(err);
    }
});

/**
 * Returns a Map<seatId, 'available' | 'held' | 'booked'> for a showtime,
 * combining its permanently-booked seats with any currently-active holds.
 *
 * Holds are looked up live (rather than trusted from a cached field) and
 * filtered by expiresAt > now, so an expired-but-not-yet-TTL-swept hold is
 * never mistakenly shown as "held" — Mongo's TTL monitor runs on its own
 * ~60s cycle and shouldn't be relied on for read-time correctness.
 */
async function getAvailability(showtime) {
    const statusMap = new Map();

    showtime.seats.forEach((seat) => {
        statusMap.set(
            seat.seatId,
            seat.status === 'booked'
                ? 'booked'
                : 'available'
        );
    });

    const paidOrders = await Order.find({
        showtime: showtime._id,
        paymentStatus: 'paid',
    });

    paidOrders.forEach((order) => {
        order.seats.forEach((seatId) => {
            statusMap.set(
                seatId,
                'booked'
            );
        });
    });

    const activeHolds = await SeatHold.find({
        showtime: showtime._id,
        expiresAt: {
            $gt: new Date()
        },
    });

    activeHolds.forEach((hold) => {
        hold.seats.forEach((seatId) => {
            if (statusMap.get(seatId) === 'available') {
                statusMap.set(
                    seatId,
                    'held'
                );
            }
        });
    });
    return statusMap;
}

router.getAvailability = getAvailability;
router.releaseExpiredHolds = releaseExpiredHolds;

module.exports = router;