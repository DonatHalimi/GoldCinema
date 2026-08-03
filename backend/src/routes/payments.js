const express = require('express');
const SeatHold = require('../models/SeatHold');
const Showtime = require('../models/Showtime');
const Movie = require('../models/Movie');
const Order = require('../models/Order');
const { requireAuth } = require('../middleware/auth');
const stripe = require('../utils/stripeClient');
const paypal = require('../utils/paypalClient');
const { generateQRTicket } = require('../utils/qr');
const { sendTicketEmail } = require('../utils/mailer');

const router = express.Router();

async function getOwnedActiveHold(req, res) {
  const { holdId } = req.body;
  const hold = await SeatHold.findById(holdId);

  if (!hold || hold.user.toString() !== req.user.id) {
    res.status(404).json({ error: 'Seat hold not found.' });
    return null;
  }
  if (hold.expiresAt < new Date()) {
    res.status(410).json({ error: 'Your seat hold has expired. Please select seats again.' });
    return null;
  }
  return hold;
}

async function finalizeOrder({ hold, userId, provider, reference, amount }) {
  const showtime = await Showtime.findById(hold.showtime);
  if (showtime) {
    hold.seats.forEach((seatId) => {
      const seat = showtime.seats.find((s) => s.seatId === seatId);
      if (seat) seat.status = 'booked';
    });
    await showtime.save();
  }

  const order = await Order.create({
    user: userId,
    movie: showtime.movie,
    showtime: showtime._id,
    seats: hold.seats,
    ticketAmount: amount,
    totalAmount: amount,
    paymentProvider: provider,
    paymentStatus: 'paid',
    paidAt: new Date(),
    ...(provider === 'stripe'
      ? { stripePaymentIntentId: reference }
      : { paypalOrderId: reference }),
  });

  await hold.deleteOne();
  return order;
}

async function computeAmount(hold) {
  const showtime = await Showtime.findById(hold.showtime);
  const movie = await Movie.findById(showtime.movie);
  return Number((movie.price * hold.seats.length).toFixed(2));
}

/* ---------------------------- Stripe ---------------------------- */

router.post('/stripe/create-intent', requireAuth, async (req, res, next) => {
  try {
    const { orderId } = req.body;

    const order = await Order.findById(orderId);

    if (!order || order.user.toString() !== req.user.id) return res.status(404).json({ error: 'Order not found.' });

    if (order.paymentStatus === 'paid') return res.status(400).json({ error: 'Order already paid.' });

    if (order.stripePaymentIntentId) {
      const existingIntent = await stripe.paymentIntents.retrieve(
        order.stripePaymentIntentId
      );

      return res.json({ clientSecret: existingIntent.client_secret });
    }

    const intent = await stripe.paymentIntents.create({
      amount: Math.round(order.totalAmount * 100),
      currency: order.currency?.toLowerCase() || 'usd',
      metadata: {
        orderId: order._id.toString(),
        userId: req.user.id,
      },
      automatic_payment_methods: {
        enabled: true
      }
    });

    order.stripePaymentIntentId = intent.id;

    await order.save();

    res.json({
      clientSecret: intent.client_secret
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/payments/stripe/confirm
router.post('/stripe/confirm', requireAuth, async (req, res, next) => {
  try {
    const { orderId, paymentIntentId } = req.body;

    const order = await Order.findById(orderId)
      .populate('user')
      .populate('movie')
      .populate({
        path: 'showtime',
        populate: [
          { path: 'cinema' },
          { path: 'screen' }
        ]
      });

    if (!order || order.user._id.toString() !== req.user.id) return res.status(404).json({ error: 'Order not found.' });

    if (order.paymentStatus === 'paid') return res.json({ order });

    if (order.stripePaymentIntentId !== paymentIntentId) {
      return res.status(400).json({ error: 'Payment intent mismatch.' });
    }

    const intent = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (intent.status !== 'succeeded') return res.status(402).json({ error: `Payment not completed (${intent.status})` });

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
    order.paymentProvider = 'stripe';
    order.paidAt = now;

    await order.save();

    if (order.holdId) await SeatHold.findByIdAndDelete(order.holdId);

    await sendTicketEmail(order.user.email, order, qrDataUrl);

    res.json({ order });
  } catch (err) {
    next(err);
  }
});

router.post('/stripe/webhook', async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error('Stripe webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === 'payment_intent.succeeded') {
    const intent = event.data.object;
    const holdId = intent.metadata?.holdId;
    const userId = intent.metadata?.userId;
    const hold = holdId && (await SeatHold.findById(holdId));
    if (hold) {
      await finalizeOrder({
        hold,
        userId,
        provider: 'stripe',
        reference: intent.id,
        amount: intent.amount / 100,
      });
    }
  }

  res.json({ received: true });
});

/* ---------------------------- PayPal ---------------------------- */

router.post('/paypal/create-order', requireAuth, async (req, res, next) => {
  try {
    const hold = await getOwnedActiveHold(req, res);
    if (!hold) return;

    const amount = await computeAmount(hold);
    const order = await paypal.createOrder({ amount, currency: 'USD', referenceId: hold._id.toString() });

    hold.paypalOrderId = order.id;
    await hold.save();

    res.json({ orderID: order.id });
  } catch (err) {
    next(err);
  }
});

router.post('/paypal/capture-order', requireAuth, async (req, res, next) => {
  try {
    const { holdId, orderID } = req.body;
    const hold = await SeatHold.findById(holdId);

    if (!hold || hold.user.toString() !== req.user.id) {
      return res.status(404).json({ error: 'Seat hold not found.' });
    }
    if (hold.paypalOrderId !== orderID) {
      return res.status(400).json({ error: 'Order does not match this hold.' });
    }

    const capture = await paypal.captureOrder(orderID);
    if (capture.status !== 'COMPLETED') {
      return res.status(402).json({ error: `Payment not completed (status: ${capture.status}).` });
    }

    const amount = await computeAmount(hold);
    const order = await finalizeOrder({
      hold,
      userId: req.user.id,
      provider: 'paypal',
      reference: orderID,
      amount,
    });

    res.json({ status: 'paid', order });
  } catch (err) {
    next(err);
  }
});

module.exports = router;