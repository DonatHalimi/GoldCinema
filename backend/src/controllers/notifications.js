const Notification = require('../models/notification');

async function getUserNotifications(req, res, next) {
    try {
        const userId = req.user.id;
        const filter = req.query.filter || 'all';
        const page = parseInt(req.query.page, 10) || 1;
        const limit = parseInt(req.query.limit, 10) || 20;
        const skip = (page - 1) * limit;

        const query = { user: userId };

        if (filter === 'unread') {
            query.archived = false;
            query.read = false;
        } else if (filter === 'archived') {
            query.archived = true;
        } else {
            query.archived = false;
        }

        const [notifications, totalCount, unreadCount] = await Promise.all([
            Notification.find(query)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit),
            Notification.countDocuments(query),
            Notification.countDocuments({ user: userId, archived: false, read: false }),
        ]);

        const totalPages = Math.ceil(totalCount / limit) || 1;

        res.json({
            notifications,
            totalCount,
            unreadCount,
            page,
            totalPages,
        });
    } catch (err) {
        next(err);
    }
}

async function getUnreadCount(req, res, next) {
    try {
        const userId = req.user.id;
        const unreadCount = await Notification.countDocuments({
            user: userId,
            archived: false,
            read: false,
        });

        res.json({ unreadCount });
    } catch (err) {
        next(err);
    }
}

async function toggleReadStatus(req, res, next) {
    try {
        const userId = req.user.id;
        const { id } = req.params;
        const { read } = req.body;

        const notification = await Notification.findOne({ _id: id, user: userId });
        if (!notification) return res.status(404).json({ error: 'Notification not found.' });

        notification.read = typeof read === 'boolean' ? read : !notification.read;
        await notification.save();

        const unreadCount = await Notification.countDocuments({
            user: userId,
            archived: false,
            read: false,
        });

        res.json({ notification, unreadCount });
    } catch (err) {
        next(err);
    }
}

async function markAllAsRead(req, res, next) {
    try {
        const userId = req.user.id;
        const result = await Notification.updateMany(
            { user: userId, archived: false, read: false },
            { $set: { read: true } }
        );

        res.json({
            message: 'All notifications marked as read.',
            modifiedCount: result.modifiedCount,
            unreadCount: 0,
        });
    } catch (err) {
        next(err);
    }
}

async function archiveAll(req, res, next) {
    try {
        const userId = req.user.id;

        const result = await Notification.updateMany(
            {
                user: userId,
                archived: false,
            },
            {
                $set: {
                    archived: true,
                    archivedAt: new Date(),
                },
            }
        );

        const unreadCount = await Notification.countDocuments({
            user: userId,
            archived: false,
            read: false,
        });

        res.json({
            message: 'All notifications archived.',
            modifiedCount: result.modifiedCount,
            unreadCount,
        });
    } catch (err) {
        next(err);
    }
}

async function unarchiveAll(req, res, next) {
    try {
        const userId = req.user.id;

        const result = await Notification.updateMany(
            {
                user: userId,
                archived: true,
            },
            {
                $set: {
                    archived: false,
                    archivedAt: null,
                },
            }
        );

        const unreadCount = await Notification.countDocuments({
            user: userId,
            archived: false,
            read: false,
        });

        res.json({
            message: 'All notifications unarchived.',
            modifiedCount: result.modifiedCount,
            unreadCount,
        });
    } catch (err) {
        next(err);
    }
}

async function toggleArchiveStatus(req, res, next) {
    try {
        const userId = req.user.id;
        const { id } = req.params;
        const { archived } = req.body;

        const notification = await Notification.findOne({ _id: id, user: userId });
        if (!notification) return res.status(404).json({ error: 'Notification not found.' });

        notification.archived = typeof archived === 'boolean' ? archived : !notification.archived;

        notification.archivedAt = notification.archived
            ? new Date()
            : null; archivedAt

        await notification.save();

        const unreadCount = await Notification.countDocuments({
            user: userId,
            archived: false,
            read: false,
        });

        res.json({ notification, unreadCount });
    } catch (err) {
        next(err);
    }
}

async function archiveAllRead(req, res, next) {
    try {
        const userId = req.user.id;
        const result = await Notification.updateMany(
            { user: userId, archived: false, read: true },
            { $set: { archived: true, archivedAt: new Date() } }
        );

        const unreadCount = await Notification.countDocuments({
            user: userId,
            archived: false,
            read: false,
        });

        res.json({
            message: 'All read notifications archived.',
            modifiedCount: result.modifiedCount,
            unreadCount,
        });
    } catch (err) {
        next(err);
    }
}

async function deleteNotification(req, res, next) {
    try {
        const userId = req.user.id;
        const { id } = req.params;

        const notification = await Notification.findOneAndDelete({ _id: id, user: userId });
        if (!notification) return res.status(404).json({ error: 'Notification not found.' });

        const unreadCount = await Notification.countDocuments({
            user: userId,
            archived: false,
            read: false,
        });

        res.json({ message: 'Notification deleted.', unreadCount });
    } catch (err) {
        next(err);
    }
}

async function clearArchived(req, res, next) {
    try {
        const userId = req.user.id;
        const result = await Notification.deleteMany({ user: userId, archived: true });

        res.json({
            message: 'Archived notifications cleared.',
            deletedCount: result.deletedCount,
        });
    } catch (err) {
        next(err);
    }
}

module.exports = {
    getUserNotifications,
    getUnreadCount,
    toggleReadStatus,
    markAllAsRead,
    archiveAll,
    unarchiveAll,
    toggleArchiveStatus,
    archiveAllRead,
    deleteNotification,
    clearArchived,
};
