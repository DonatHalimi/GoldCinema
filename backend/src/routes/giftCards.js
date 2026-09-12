const express = require('express');
const {
    requireAuth,
} = require('../middleware/auth');
const {
    createGiftCardSchema,
    stripeCreateIntentSchema,
    stripeConfirmSchema,
    paypalCreateOrderSchema,
    paypalCaptureOrderSchema,
    redeemGiftCardSchema,
} = require('../validations/giftCard');
const {
    createDraft,
    createStripeIntent,
    confirmStripePayment,
    createPaypalOrder,
    capturePaypalOrder,
    lookupGiftCard,
    redeemGiftCard,
} = require('../controllers/giftCards');
const { validateBody } = require('../validations');

const router = express.Router();

router.post('/', requireAuth, validateBody(createGiftCardSchema), createDraft);
router.post('/stripe/create-intent', requireAuth, validateBody(stripeCreateIntentSchema), createStripeIntent);
router.post('/stripe/confirm', requireAuth, validateBody(stripeConfirmSchema), confirmStripePayment);
router.post('/paypal/create-order', requireAuth, validateBody(paypalCreateOrderSchema), createPaypalOrder);
router.post('/paypal/capture-order', requireAuth, validateBody(paypalCaptureOrderSchema), capturePaypalOrder);
router.get('/lookup/:code', requireAuth, lookupGiftCard);
router.post('/redeem', requireAuth, validateBody(redeemGiftCardSchema), redeemGiftCard);

module.exports = router;