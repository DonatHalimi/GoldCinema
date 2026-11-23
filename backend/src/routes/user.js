const express = require('express');
const router = express.Router();
const {
    getUsers,
    createUser,
    updateUserStatus,
    deleteUser,
} = require('../controllers/user');
const { requireAuth } = require('../middleware/auth');
const { requirePermission } = require('../middleware/roleAccess');

router.post('/', requireAuth, requirePermission('users:manage'), createUser);
router.get('/', requireAuth, requirePermission('users:read'), getUsers);
router.put('/:id', requireAuth, requirePermission('users:manage'), updateUserStatus);
router.delete('/:id', requireAuth, requirePermission('users:manage'), deleteUser);

module.exports = router;