const Order = require('../models/order');

async function getMyOrders(req, res, next) {
    try {
        const orders = await Order.find({ user: req.user.id })
            .populate('movie', 'title posterUrl')
            .populate('showtime', 'startTime')
            .sort({ createdAt: -1 });

        res.json({ orders });
    } catch (err) {
        next(err);
    }
}

async function getOrderById(req, res, next) {
    try {
        const order = await Order.findById(req.params.id)
            .populate('movie')
            .populate('showtime')
            .populate('snacks.snack');

        if (!order || order.user.toString() !== req.user.id) {
            return res.status(404).json({ error: 'Order not found.' });
        }

        res.json({ order });
    } catch (err) {
        next(err);
    }
}

async function createOrder(req, res, next) {
    try {
        const {
            movie,
            showtime,
            seats,
            ticketAmount,
            snacks = [],
            snackAmount = 0,
            totalAmount,
            holdId,
            holdExpiresAt,
        } = req.body;

        const calculatedTotal = totalAmount ?? (Number(ticketAmount || 0) + Number(snackAmount || 0));

        const order = await Order.create({
            user: req.user.id,
            movie,
            showtime,
            seats,
            snacks,
            ticketAmount,
            snackAmount,
            totalAmount: calculatedTotal,
            holdId,
            holdExpiresAt,
            paymentStatus: 'pending',
        });

        res.status(201).json({ order });
    } catch (err) {
        next(err);
    }
}

module.exports = {
    getMyOrders,
    getOrderById,
    createOrder,
};