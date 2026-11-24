const express = require('express');
const { requireAuth } = require('../middleware/auth');
const {
    getMyOrders,
    getOrderById,
    createOrder,
    getConcessions,
    updateOrderConcessions,
    applyGiftCard,
    removeGiftCard,
    finalizeWithGiftCard,
} = require('../controllers/orders');
const {
    validateBody,
    validateParams,
    order: { orderCreateSchema, orderIdSchema, concessionSelectionSchema },
} = require('../validations');

const router = express.Router();
const { requirePermission } = require('../middleware/roleAccess');

router.get('/mine', requireAuth, requirePermission('orders:read'), getMyOrders);
router.get('/concessions', requireAuth, requirePermission('orders:read'), getConcessions);
router.get('/:id', requireAuth, requirePermission('orders:read'), validateParams(orderIdSchema), getOrderById);
router.post('/', requireAuth, requirePermission('orders:manage'), validateBody(orderCreateSchema), createOrder);
router.put('/:id/concessions', requireAuth, requirePermission('orders:manage'), validateParams(orderIdSchema), validateBody(concessionSelectionSchema), updateOrderConcessions);
router.post('/:id/apply-gift-card', requireAuth, requirePermission('orders:manage'), validateParams(orderIdSchema), applyGiftCard);
router.post('/:id/remove-gift-card', requireAuth, requirePermission('orders:manage'), validateParams(orderIdSchema), removeGiftCard);
router.post('/:id/finalize-with-gift-card', requireAuth, requirePermission('orders:manage'), validateParams(orderIdSchema), finalizeWithGiftCard);

module.exports = router;