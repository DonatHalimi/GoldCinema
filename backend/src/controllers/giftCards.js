const GiftCard = require('../models/giftCard');
const stripe = require('../utils/stripeClient');
const paypal = require('../utils/paypalClient');
const { generateUniqueGiftCardCode } = require('../utils/giftCardCode');
const { sendGiftCardEmail } = require('../utils/mailer');
const User = require('../models/user');
const { getOrCreateStripeCustomer } = require('../utils/stripeCustomer');

const ALLOWED_TEMPLATES = [
    'classic-gold',
    'birthday',
    'vip-access',
    'holiday',
    'popcorn-treat',
    'thank-you',
    'valentines',
    'movie-night',
    'midnight-screening',
    'you-deserve-it',
    'red-carpet',
    'treat-yourself'
];

async function createDraft(req, res, next) {
    try {
        const { amount, backgroundTemplate, senderName, senderEmail, recipientName, recipientEmail, message } = req.body;

        const value = Number(amount);
        if (!Number.isFinite(value) || value < 5 || value > 500) {
            return res.status(400).json({ error: 'Gift card amount must be between $5 and $500.' });
        }

        if (!ALLOWED_TEMPLATES.includes(backgroundTemplate)) {
            return res.status(400).json({ error: 'Invalid background template.' });
        }

        const code = await generateUniqueGiftCardCode();

        const giftCard = await GiftCard.create({
            code,
            initialValue: value,
            balance: value,
            backgroundTemplate,
            purchasedBy: req.user.id,
            senderName,
            senderEmail,
            recipientName,
            recipientEmail,
            message,
        });

        res.status(201).json({ giftCard });
    } catch (err) {
        next(err);
    }
}

async function createStripeIntent(req, res, next) {
    try {
        const { giftCardId, paymentMethodId } = req.body;

        const giftCard = await GiftCard.findById(giftCardId);

        if (!giftCard || giftCard.purchasedBy.toString() !== req.user.id) return res.status(404).json({ error: 'Gift card not found.', });

        if (giftCard.paymentStatus === 'paid') return res.status(400).json({ error: 'This gift card has already been paid for.', });

        const user = await User.findById(req.user.id);
        const customerId = await getOrCreateStripeCustomer(user);

        let intent;

        if (giftCard.stripePaymentIntentId) {
            intent = await stripe.paymentIntents.retrieve(giftCard.stripePaymentIntentId);

            if (intent.status === 'succeeded') return res.status(400).json({ error: 'This payment has already been completed.', });

            if (paymentMethodId && ['requires_payment_method', 'requires_confirmation', 'requires_action',].includes(intent.status)) {
                const paymentMethod = await stripe.paymentMethods.retrieve(paymentMethodId);

                if (paymentMethod.customer && paymentMethod.customer.toString() !== customerId.toString()) {
                    return res.status(403).json({ error: 'Payment method does not belong to your account.', });
                }

                intent = await stripe.paymentIntents.update(intent.id, { payment_method: paymentMethodId });
            }

            return res.json({ clientSecret: intent.client_secret, });
        }

        const intentParams = {
            amount: Math.round(giftCard.initialValue * 100),
            currency: giftCard.currency.toLowerCase(),
            customer: customerId,
            metadata: {
                giftCardId: giftCard._id.toString(),
                userId: req.user.id,
            },
        };

        if (paymentMethodId) {
            const paymentMethod = await stripe.paymentMethods.retrieve(paymentMethodId);

            if (paymentMethod.customer && paymentMethod.customer.toString() !== customerId.toString()) {
                return res.status(403).json({ error: 'Payment method does not belong to your account.', });
            }

            intentParams.payment_method = paymentMethodId;
        } else {
            intentParams.automatic_payment_methods = { enabled: true };
        }

        intent = await stripe.paymentIntents.create(intentParams);
        giftCard.stripePaymentIntentId = intent.id;
        await giftCard.save();
        return res.json({ clientSecret: intent.client_secret, });
    } catch (err) {
        next(err);
    }
}

async function confirmStripePayment(req, res, next) {
    try {
        const { giftCardId, paymentIntentId } = req.body;

        const giftCard = await GiftCard.findById(giftCardId);

        if (!giftCard || giftCard.purchasedBy.toString() !== req.user.id) return res.status(404).json({ error: 'Gift card not found.', });

        if (giftCard.paymentStatus === 'paid') return res.json({ giftCard });

        if (giftCard.stripePaymentIntentId !== paymentIntentId) return res.status(400).json({ error: 'Payment intent mismatch.', });

        const intent = await stripe.paymentIntents.retrieve(paymentIntentId);

        if (intent.status !== 'succeeded') return res.status(402).json({ error: `Payment not completed (${intent.status})`, });

        giftCard.paymentStatus = 'paid';
        giftCard.paymentProvider = 'stripe';

        await giftCard.save();

        sendGiftCardEmail(giftCard).catch((err) => console.error('GIFT CARD EMAIL ERROR:', err));

        return res.json({ giftCard });
    } catch (err) {
        next(err);
    }
}

async function createPaypalOrder(req, res, next) {
    try {
        const { giftCardId } = req.body;
        const giftCard = await GiftCard.findById(giftCardId);

        if (!giftCard || giftCard.purchasedBy.toString() !== req.user.id) {
            return res.status(404).json({ error: 'Gift card not found.' });
        }

        const order = await paypal.createOrder({
            amount: giftCard.initialValue,
            currency: giftCard.currency,
            referenceId: giftCard._id.toString(),
        });

        giftCard.paypalOrderId = order.id;
        await giftCard.save();

        res.json({ orderID: order.id });
    } catch (err) {
        next(err);
    }
}

async function capturePaypalOrder(req, res, next) {
    try {
        const { giftCardId, orderID } = req.body;
        const giftCard = await GiftCard.findById(giftCardId);

        if (!giftCard || giftCard.purchasedBy.toString() !== req.user.id) return res.status(404).json({ error: 'Gift card not found.' });

        if (giftCard.paypalOrderId !== orderID) return res.status(400).json({ error: 'Order does not match this gift card.' });

        const capture = await paypal.captureOrder(orderID);
        if (capture.status !== 'COMPLETED') return res.status(402).json({ error: `Payment not completed (status: ${capture.status}).` });

        giftCard.paymentStatus = 'paid';
        giftCard.paymentProvider = 'paypal';
        await giftCard.save();

        sendGiftCardEmail(giftCard).catch((err) => console.error('GIFT CARD EMAIL ERROR:', err));

        res.json({ giftCard });
    } catch (err) {
        next(err);
    }
}

async function lookupGiftCard(req, res, next) {
    try {
        const { code } = req.params;
        const giftCard = await GiftCard.findOne({ code: code.toUpperCase(), paymentStatus: 'paid' });

        if (!giftCard || giftCard.status !== 'active') {
            return res.status(404).json({ error: 'Gift card not found or no longer active.' });
        }

        res.json({ code: giftCard.code, balance: giftCard.balance, currency: giftCard.currency });
    } catch (err) {
        next(err);
    }
}

async function redeemGiftCard(req, res, next) {
    try {
        const { code, orderId, amount } = req.body;
        const redeemAmount = Number(amount);

        if (!Number.isFinite(redeemAmount) || redeemAmount <= 0) {
            return res.status(400).json({ error: 'Invalid redemption amount.' });
        }

        const giftCard = await GiftCard.findOneAndUpdate(
            {
                code: String(code).toUpperCase(),
                paymentStatus: 'paid',
                status: 'active',
                balance: { $gte: redeemAmount },
            },
            {
                $inc: { balance: -redeemAmount },
                $push: { redemptions: { order: orderId, amount: redeemAmount } },
            },
            { new: true }
        );

        if (!giftCard) return res.status(400).json({ error: 'Gift card is invalid, inactive, or has insufficient balance.' });

        if (giftCard.balance <= 0 && giftCard.status !== 'disabled') {
            giftCard.status = 'depleted';
            await giftCard.save();
        }

        res.json({ redeemed: redeemAmount, remainingBalance: giftCard.balance });
    } catch (err) {
        next(err);
    }
}

module.exports = {
    createDraft,
    createStripeIntent,
    confirmStripePayment,
    createPaypalOrder,
    capturePaypalOrder,
    lookupGiftCard,
    redeemGiftCard,
};