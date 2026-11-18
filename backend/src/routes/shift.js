const express = require('express');
const { requireAuth } = require('../middleware/auth');
const { requirePermission } = require('../middleware/roleAccess');
const {
    getAllShifts,
    getShiftById,
    getMyShifts,
    createShift,
    updateShift,
    updateShiftStatus,
    deleteShift,
} = require('../controllers/shift');

const router = express.Router();

router.use(requireAuth);
router.get('/me', requirePermission('shifts:self'), getMyShifts);
router.get('/', requirePermission('shifts:read'), getAllShifts);
router.get('/:id', requirePermission('shifts:read'), getShiftById);
router.post('/', requirePermission('shifts:manage'), createShift);
router.put('/:id', requirePermission('shifts:manage'), updateShift);
router.patch('/:id/status', requirePermission('shifts:manage'), updateShiftStatus);
router.delete('/:id', requirePermission('shifts:manage'), deleteShift);

module.exports = router;