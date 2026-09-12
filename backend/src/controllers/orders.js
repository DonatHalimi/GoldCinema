const Order = require('../models/order');
const GiftCard = require('../models/giftCard');
const { generateQRTicket } = require('../utils/qr');
const { SeatHold } = require('../models');
const { sendTicketEmail } = require('../utils/mailer');
const MIN_CHARGEABLE_AMOUNT = 0.5;

async function getMyOrders(req, res, next) {
    try {
        const orders = await Order.find({
            user: req.user.id,
            paymentStatus: 'paid',
        })
            .populate('movie', 'title posterUrl')
            .populate('showtime', 'startTime')
            .populate('snacks.snack')
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

        if (!order || order.user.toString() !== req.user.id) return res.status(404).json({ error: 'Order not found.' });

        const paymentOptions = {
            stripeConfigured: !!process.env.STRIPE_SECRET_KEY,
            paypalConfigured: !!(process.env.PAYPAL_CLIENT_ID && process.env.PAYPAL_CLIENT_SECRET),
            stripePublishableKey: process.env.STRIPE_PUBLISHABLE_KEY || null,
        };

        res.json({ order, paymentOptions });
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

function computeTotal(order) {
    const base = Number(order.ticketAmount || 0) + Number(order.snackAmount || 0);
    return Math.max(0, Number((base - Number(order.giftCardAmount || 0)).toFixed(2)));
}

async function applyGiftCard(req, res, next) {
    try {
        const { code } = req.body;
        const order = await Order.findById(req.params.id);

        if (!order || order.user.toString() !== req.user.id) return res.status(404).json({ error: 'Order not found.' });

        if (order.paymentStatus === 'paid') return res.status(400).json({ error: 'This order has already been paid.' });

        const giftCard = await GiftCard.findOne({
            code: String(code).toUpperCase(),
            paymentStatus: 'paid',
            status: 'active',
        });

        if (!giftCard) return res.status(400).json({ error: 'Gift card is invalid or no longer active.' });

        const base = Number(order.ticketAmount || 0) + Number(order.snackAmount || 0);
        const MIN_CHARGEABLE_AMOUNT = 0.5;
        const wouldFullyCover = giftCard.balance >= base;
        const applied = wouldFullyCover ? base : Math.min(giftCard.balance, Math.max(0, base - MIN_CHARGEABLE_AMOUNT));

        order.giftCardCode = giftCard.code;
        order.giftCardAmount = applied;
        order.totalAmount = computeTotal(order);

        order.stripePaymentIntentId = undefined;

        await order.save();

        res.json({ order });
    } catch (err) {
        next(err);
    }
}

async function removeGiftCard(req, res, next) {
    try {
        const order = await Order.findById(req.params.id);

        if (!order || order.user.toString() !== req.user.id) return res.status(404).json({ error: 'Order not found.' });

        if (order.paymentStatus === 'paid') return res.status(400).json({ error: 'This order has already been paid.' });

        order.giftCardCode = null;
        order.giftCardAmount = 0;
        order.totalAmount = computeTotal(order);
        order.stripePaymentIntentId = undefined;

        await order.save();

        res.json({ order });
    } catch (err) {
        next(err);
    }
}

async function finalizeWithGiftCard(req, res, next) {
    try {
        const order = await Order.findById(req.params.id)
            .populate('user')
            .populate('movie')
            .populate({
                path: 'showtime',
                populate: [{ path: 'cinema' }, { path: 'screen' }],
            });

        if (!order || order.user._id.toString() !== req.user.id) return res.status(404).json({ error: 'Order not found.' });

        if (order.paymentStatus === 'paid') return res.json({ order });

        if (!order.giftCardCode || order.totalAmount >= MIN_CHARGEABLE_AMOUNT) return res.status(400).json({ error: 'This order requires a card or PayPal payment and cannot be finalized with a gift card alone.' });

        const redeemed = await GiftCard.findOneAndUpdate(
            {
                code: order.giftCardCode,
                balance: { $gte: order.giftCardAmount },
                paymentStatus: 'paid',
                status: 'active',
            },
            {
                $inc: {
                    balance: -order.giftCardAmount,
                },
                $push: {
                    redemptions: {
                        order: order._id,
                        amount: order.giftCardAmount,
                    },
                },
            },
            { new: true }
        );

        if (!redeemed) return res.status(400).json({ error: 'Gift card has insufficient balance or is not available.', });

        const qrDataUrl = await generateQRTicket({
            orderId: order._id,
            userId: order.user._id,
            seats: order.seats,
        });

        const now = new Date();

        order.qrTicket = {
            dataUrl: qrDataUrl,
            issuedAt: now,
        };

        order.paymentStatus = 'paid';
        order.paymentProvider = null;
        order.paidAt = now;

        await order.save();

        if (order.holdId) await SeatHold.findByIdAndDelete(order.holdId);

        await sendTicketEmail(order.user.email, order, qrDataUrl);

        return res.json({ order });
    } catch (err) {
        next(err);
    }
}

module.exports = {
    getMyOrders,
    getOrderById,
    createOrder,
    applyGiftCard,
    removeGiftCard,
    finalizeWithGiftCard,
};