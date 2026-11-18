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

const router = express.Router();

router.use(requireAuth);

router.get('/', getUserNotifications);
router.get('/unread-count', getUnreadCount);
router.patch('/read-all', markAllAsRead);
router.patch('/archive-all', archiveAll);
router.patch('/unarchive-all', unarchiveAll);
router.patch('/archive-all-read', archiveAllRead);
router.delete('/clear-archived', clearArchived);

router.patch('/:id/read', updateReadStatus);
router.patch('/:id/archive', updateArchiveStatus);
router.delete('/:id', deleteNotification);

module.exports = router;
