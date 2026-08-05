const express = require('express');
const { requireAuth } = require('../middleware/auth');
const {
    getMyOrders,
    getOrderById,
    createOrder,
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

module.exports = router;