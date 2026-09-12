const express = require('express');
const yup = require('yup');
const { requireAuth } = require('../middleware/auth');

const {
    createDraft,
    createStripeIntent,
    confirmStripePayment,
    createPaypalOrder,
    capturePaypalOrder,
    lookupGiftCard,
    redeemGiftCard,
} = require('../controllers/giftCards');

const router = express.Router();

const createGiftCardSchema = yup
    .object({
        amount: yup
            .number()
            .min(5, 'Amount must be at least 5.')
            .max(500, 'Amount cannot exceed 500.')
            .required('Amount is required.'),

        backgroundTemplate: yup
            .string()
            .required('Background template is required.'),

        senderName: yup
            .string()
            .trim()
            .required('Sender name is required.'),

        senderEmail: yup
            .string()
            .email('Invalid sender email.')
            .required('Sender email is required.'),

        recipientName: yup
            .string()
            .trim()
            .required('Recipient name is required.'),

        recipientEmail: yup
            .string()
            .email('Invalid recipient email.')
            .required('Recipient email is required.'),

        message: yup
            .string()
            .max(500, 'Message cannot exceed 500 characters.')
            .notRequired(),
    })
    .noUnknown(true);

const stripeCreateIntentSchema = yup
    .object({
        giftCardId: yup
            .string()
            .required('Gift card ID is required.'),

        paymentMethodId: yup
            .string()
            .notRequired(),
    })
    .noUnknown(true);

const stripeConfirmSchema = yup
    .object({
        giftCardId: yup
            .string()
            .required('Gift card ID is required.'),

        paymentIntentId: yup
            .string()
            .required('Payment intent ID is required.'),
    })
    .noUnknown(true);

const paypalCreateOrderSchema = yup
    .object({
        giftCardId: yup
            .string()
            .required('Gift card ID is required.'),
    })
    .noUnknown(true);

const paypalCaptureOrderSchema = yup
    .object({
        giftCardId: yup
            .string()
            .required('Gift card ID is required.'),

        orderID: yup
            .string()
            .required('PayPal order ID is required.'),
    })
    .noUnknown(true);

const redeemGiftCardSchema = yup
    .object({
        code: yup
            .string()
            .required('Gift card code is required.'),

        orderId: yup
            .string()
            .required('Order ID is required.'),

        amount: yup
            .number()
            .min(0.01, 'Amount must be greater than 0.')
            .required('Amount is required.'),
    })
    .noUnknown(true);

module.exports = {
    createGiftCardSchema,
    stripeCreateIntentSchema,
    stripeConfirmSchema,
    paypalCreateOrderSchema,
    paypalCaptureOrderSchema,
    redeemGiftCardSchema,
};