const express = require('express');
const Order = require('../models/Order');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

router.get('/mine', requireAuth, async (req, res, next) => {
    try {
        const orders = await Order.find({ user: req.user.id })
            .populate('movie', 'title posterUrl')
            .populate('showtime', 'startTime')
            .sort({ createdAt: -1 });
        res.json({ orders });
    } catch (err) {
        next(err);
    }
});

router.get('/:id', requireAuth, async (req, res, next) => {
    try {
        const order = await Order.findById(req.params.id)
            .populate('movie')
            .populate('showtime');
        if (!order || order.user.toString() !== req.user.id) {
            return res.status(404).json({ error: 'Order not found.' });
        }
        res.json({ order });
    } catch (err) {
        next(err);
    }
});

router.post('/', requireAuth, async (req, res, next) => {
    try {
        const { movie, showtime, seats, ticketAmount, totalAmount, holdId, holdExpiresAt } = req.body;

        const amount = totalAmount ?? ticketAmount;

        const order = await Order.create({
            user: req.user.id,
            movie,
            showtime,
            seats,
            ticketAmount: amount,
            totalAmount: amount,
            holdId,
            holdExpiresAt,
            paymentStatus: 'pending'
        });

        res.status(201).json({ order });
    } catch (err) {
        next(err);
    }
});

module.exports = router;