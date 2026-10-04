const express = require('express');
const router = express.Router();
const {
    getUsers,
    createUser,
    updateUserStatus,
    deleteUser,
    bulkDeleteUsers
} = require('../controllers/user');
const { requireAuth, requireAdmin } = require('../middleware/auth');

router.post('/', requireAuth, requireAdmin, createUser);
router.get('/', requireAuth, requireAdmin, getUsers);
router.put('/:id', requireAuth, requireAdmin, updateUserStatus);
router.delete('/:id', requireAuth, requireAdmin, deleteUser);
router.delete('/', requireAuth, requireAdmin, bulkDeleteUsers);

module.exports = router;