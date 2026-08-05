const express = require('express');
const { requireAuth } = require('../middleware/auth');
const {
  createStripeIntent,
  confirmStripePayment,
  stripeWebhook,
  createPaypalOrder,
  capturePaypalOrder,
} = require('../controllers/payments');

const router = express.Router();

router.post('/stripe/create-intent', requireAuth, createStripeIntent);
router.post('/stripe/confirm', requireAuth, confirmStripePayment);
router.post('/stripe/webhook', stripeWebhook);
router.post('/paypal/create-order', requireAuth, createPaypalOrder);
router.post('/paypal/capture-order', requireAuth, capturePaypalOrder);

module.exports = router;