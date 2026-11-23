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
const { requirePermission } = require('../middleware/roleAccess');

const router = express.Router();

router.post('/', requireAuth, requirePermission('gift-cards:manage'), validateBody(createGiftCardSchema), createDraft);
router.post('/stripe/create-intent', requireAuth, requirePermission('gift-cards:manage'), validateBody(stripeCreateIntentSchema), createStripeIntent);
router.post('/stripe/confirm', requireAuth, requirePermission('gift-cards:manage'), validateBody(stripeConfirmSchema), confirmStripePayment);
router.post('/paypal/create-order', requireAuth, requirePermission('gift-cards:manage'), validateBody(paypalCreateOrderSchema), createPaypalOrder);
router.post('/paypal/capture-order', requireAuth, requirePermission('gift-cards:manage'), validateBody(paypalCaptureOrderSchema), capturePaypalOrder);
router.get('/lookup/:code', requireAuth, requirePermission('gift-cards:manage'), lookupGiftCard);
router.post('/redeem', requireAuth, requirePermission('gift-cards:manage'), validateBody(redeemGiftCardSchema), redeemGiftCard);

module.exports = router;