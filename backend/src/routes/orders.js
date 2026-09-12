const express = require('express');
const { requireAuth } = require('../middleware/auth');
const {
    getMyOrders,
    getOrderById,
    createOrder,
    applyGiftCard,
    removeGiftCard,
    finalizeWithGiftCard,
} = require('../controllers/orders');
const {
    validateBody,
    validateParams,
    order: { orderCreateSchema, orderIdSchema },
} = require('../validations');

const router = express.Router();

router.get('/mine', requireAuth, getMyOrders);
router.get('/:id', requireAuth, validateParams(orderIdSchema), getOrderById);
router.post('/', requireAuth, validateBody(orderCreateSchema), createOrder);
router.post('/:id/apply-gift-card', requireAuth, validateParams(orderIdSchema), applyGiftCard);
router.post('/:id/remove-gift-card', requireAuth, validateParams(orderIdSchema), removeGiftCard);
router.post('/:id/finalize-with-gift-card', requireAuth, validateParams(orderIdSchema), finalizeWithGiftCard);

module.exports = router;