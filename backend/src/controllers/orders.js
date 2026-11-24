const Order = require('../models/order');
const GiftCard = require('../models/giftCard');
const { generateQRTicket } = require('../utils/qr');
const { SeatHold } = require('../models');
const { sendTicketEmail } = require('../utils/mailer');
const { notifyPurchase } = require('../utils/notifications');
const Movie = require('../models/movie');
const Showtime = require('../models/showtime');
const {
    ConcessionSelectionError,
    getConcessionAmount,
    getConcessionCatalog,
    normalizeConcessions,
} = require('../services/concessions');
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
        const { movie, showtime, seats, holdId } = req.body;
        const [movieRecord, showtimeRecord, hold] = await Promise.all([
            Movie.findById(movie),
            Showtime.findById(showtime),
            SeatHold.findById(holdId),
        ]);

        if (!movieRecord || !showtimeRecord || showtimeRecord.movie.toString() !== movieRecord.id) {
            return res.status(400).json({ error: 'The selected movie and showtime do not match.' });
        }

        const selectedSeats = [...new Set(seats)];
        if (
            !hold ||
            hold.user.toString() !== req.user.id ||
            hold.showtime.toString() !== showtimeRecord.id ||
            hold.expiresAt <= new Date() ||
            selectedSeats.length !== seats.length ||
            selectedSeats.length !== hold.seats.length ||
            !selectedSeats.every((seatId) => hold.seats.includes(seatId))
        ) {
            return res.status(400).json({ error: 'An active seat hold matching this booking is required.' });
        }

        const ticketAmount = Math.round(Number(movieRecord.price) * seats.length * 100) / 100;

        const order = await Order.create({
            user: req.user.id,
            movie: movieRecord._id,
            showtime: showtimeRecord._id,
            seats: selectedSeats,
            snacks: [],
            ticketAmount,
            snackAmount: 0,
            totalAmount: ticketAmount,
            concessionsSelected: false,
            holdId,
            holdExpiresAt: hold.expiresAt,
            paymentStatus: 'pending',
        });

        res.status(201).json({ order });
    } catch (err) {
        next(err);
    }
}

async function getConcessions(req, res, next) {
    try {
        res.json({ concessions: await getConcessionCatalog() });
    } catch (err) {
        next(err);
    }
}

async function updateOrderConcessions(req, res, next) {
    try {
        const order = await Order.findById(req.params.id);
        if (!order || order.user.toString() !== req.user.id) {
            return res.status(404).json({ error: 'Order not found.' });
        }
        if (order.paymentStatus !== 'pending') {
            return res.status(400).json({ error: 'Concessions can only be selected for an unpaid order.' });
        }
        if (order.concessionsSelected) {
            return res.status(409).json({ error: 'Concessions have already been selected for this order.' });
        }
        if (order.stripePaymentIntentId || order.paypalOrderId) {
            return res.status(409).json({ error: 'Restart checkout before changing concessions.' });
        }
        if (order.giftCardAmount > 0) {
            return res.status(409).json({ error: 'Remove the gift card before selecting concessions.' });
        }

        const hold = order.holdId && await SeatHold.findById(order.holdId);
        if (
            !hold ||
            hold.user.toString() !== req.user.id ||
            hold.expiresAt <= new Date() ||
            hold.showtime.toString() !== order.showtime.toString() ||
            order.seats.length !== hold.seats.length ||
            !order.seats.every((seatId) => hold.seats.includes(seatId))
        ) {
            return res.status(410).json({ error: 'Your seat hold has expired. Please select seats again.' });
        }

        const snacks = await normalizeConcessions(req.body.items);
        const snackAmount = getConcessionAmount(snacks);
        const ticketCents = Math.round(Number(order.ticketAmount || 0) * 100);
        const snackCents = Math.round(snackAmount * 100);

        order.snacks = snacks;
        order.snackAmount = snackAmount;
        order.totalAmount = Math.max(0, ticketCents + snackCents - Math.round(Number(order.giftCardAmount || 0) * 100)) / 100;
        order.concessionsSelected = true;
        await order.save();

        res.json({ order });
    } catch (err) {
        if (err instanceof ConcessionSelectionError) {
            return res.status(err.statusCode).json({ error: err.message });
        }
        next(err);
    }
}

function computeTotal(order) {
    const baseCents = Math.round(Number(order.ticketAmount || 0) * 100) + Math.round(Number(order.snackAmount || 0) * 100);
    return Math.max(0, baseCents - Math.round(Number(order.giftCardAmount || 0) * 100)) / 100;
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
            concessions: order.snacks,
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

        await notifyPurchase({
            userId: order.user._id,
            orderId: order._id,
            movieTitle: order.movie?.title || 'Movie',
            seats: order.seats || [],
            amount: order.totalAmount || 0,
        });

        await sendTicketEmail(order.user.email, order, qrDataUrl);

        return res.json({ order });
    } catch (err) {
        next(err);
    }
}

async function bulkDeleteOrders(req, res, next) {
    try {
        const { ids } = req.body;

        if (!Array.isArray(ids) || ids.length === 0) return res.status(400).json({ error: 'Please provide an array of order IDs' });

        const result = await Order.deleteMany({ _id: { $in: ids } });

        res.status(200).json({
            message: `Successfully deleted ${result.deletedCount} order(s)`,
            deletedCount: result.deletedCount,
        });
    } catch (err) {
        next(err);
    }
}

module.exports = {
    getMyOrders,
    getOrderById,
    createOrder,
    getConcessions,
    updateOrderConcessions,
    applyGiftCard,
    removeGiftCard,
    finalizeWithGiftCard,
    bulkDeleteOrders,
};