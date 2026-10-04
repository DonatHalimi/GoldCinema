const express = require('express');
const { requireAuth } = require('../middleware/auth');
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

router.get('/me', getMyShifts);
router.get('/', getAllShifts);
router.get('/:id', getShiftById);
router.post('/', createShift);
router.put('/:id', updateShift);
router.patch('/:id/status', updateShiftStatus);
router.delete('/:id', deleteShift);

module.exports = router;