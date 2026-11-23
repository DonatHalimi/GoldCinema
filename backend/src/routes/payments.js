const express = require('express');
const { requireAuth } = require('../middleware/auth');
const {
  createStripeIntent,
  confirmStripePayment,
  stripeWebhook,
  createPaypalOrder,
  capturePaypalOrder,
} = require('../controllers/payments');

const {
  listPaymentMethods,
  createSetupIntent,
  setDefaultPaymentMethod,
  removePaymentMethod,
} = require('../controllers/paymentMethods');
const router = express.Router();
const { requirePermission } = require('../middleware/roleAccess');

router.post('/stripe/create-intent', requireAuth, requirePermission('payments:manage'), createStripeIntent);
router.post('/stripe/confirm', requireAuth, requirePermission('payments:manage'), confirmStripePayment);
router.post('/stripe/webhook', stripeWebhook);
router.post('/paypal/create-order', requireAuth, requirePermission('payments:manage'), createPaypalOrder);
router.post('/paypal/capture-order', requireAuth, requirePermission('payments:manage'), capturePaypalOrder);

router.get('/methods', requireAuth, requirePermission('payments:read'), listPaymentMethods);
router.post('/setup', requireAuth, requirePermission('payments:manage'), createSetupIntent);
router.post('/methods/:id/default', requireAuth, requirePermission('payments:manage'), setDefaultPaymentMethod);
router.delete('/methods/:id', requireAuth, requirePermission('payments:manage'), removePaymentMethod);


module.exports = router;