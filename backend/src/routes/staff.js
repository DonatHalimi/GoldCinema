const express = require('express');
const { requireAuth } = require('../middleware/auth');
const { requirePermission } = require('../middleware/roleAccess');
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

router.get('/me', requirePermission('staff:self'), getMyStaffProfile);
router.get('/', requirePermission('staff:read'), getAllStaff);
router.get('/:id', requirePermission('staff:read'), getStaffById);
router.post('/', requirePermission('staff:manage'), createStaff);
router.put('/:id', requirePermission('staff:manage'), updateStaff);
router.patch('/:id/toggle-active', requirePermission('staff:manage'), toggleStaffActive);
router.delete('/:id', requirePermission('staff:manage'), deleteStaff);

module.exports = router;