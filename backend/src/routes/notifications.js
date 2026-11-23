const express = require('express');
const { requireAuth } = require('../middleware/auth');
const {
    getUserNotifications,
    getUnreadCount,
    updateReadStatus,
    markAllAsRead,
    archiveAll,
    unarchiveAll,
    updateArchiveStatus,
    archiveAllRead,
    deleteNotification,
    clearArchived,
} = require('../controllers/notifications');
const { requirePermission } = require('../middleware/roleAccess');

const router = express.Router();

router.use(requireAuth, requirePermission('notifications:read'));

router.get('/', getUserNotifications);
router.get('/unread-count', getUnreadCount);
router.patch('/read-all', requirePermission('notifications:manage'), markAllAsRead);
router.patch('/archive-all', requirePermission('notifications:manage'), archiveAll);
router.patch('/unarchive-all', requirePermission('notifications:manage'), unarchiveAll);
router.patch('/archive-all-read', requirePermission('notifications:manage'), archiveAllRead);
router.delete('/clear-archived', requirePermission('notifications:manage'), clearArchived);

router.patch('/:id/read', requirePermission('notifications:manage'), updateReadStatus);
router.patch('/:id/archive', requirePermission('notifications:manage'), updateArchiveStatus);
router.delete('/:id', requirePermission('notifications:manage'), deleteNotification);

module.exports = router;
