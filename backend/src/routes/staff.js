const express = require('express');
const { requireAuth } = require('../middleware/auth');
const {
    getAllStaff,
    getStaffById,
    getMyStaffProfile,
    createStaff,
    updateStaff,
    toggleStaffActive,
    deleteStaff,
} = require('../controllers/staff');

const router = express.Router();

router.use(requireAuth);
router.get('/me', getMyStaffProfile);
router.get('/', getAllStaff);
router.get('/:id', getStaffById);
router.post('/', createStaff);
router.put('/:id', updateStaff);
router.patch('/:id/toggle-active', toggleStaffActive);
router.delete('/:id', deleteStaff);

module.exports = router;