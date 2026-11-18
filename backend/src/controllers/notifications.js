const mongoose = require('mongoose');
const Notification = require('../models/notification');

const MAX_PAGE_SIZE = 50;
const MAX_PAGE_NUMBER = 1000000;

const ALLOWED_FILTERS = new Set([
    'all',
    'unread',
    'archived',
]);

function parsePositiveInteger(value, fallback, maximum) {
    if (value === undefined) return fallback;

    if (typeof value !== 'string' && typeof value !== 'number') return null;

    const parsed = Number(value);

    if (!Number.isSafeInteger(parsed) || parsed < 1) return null;

    return Math.min(parsed, maximum);
}

function getUserId(req) {
    return req.user?._id || req.user?.id;
}

function isValidNotificationId(req, res) {
    if (!mongoose.isValidObjectId(req.params.id)) {
        res.status(400).json({ error: 'Invalid notification ID.', });

        return false;
    }

    return true;
}

async function countUnreadNotifications(userId) {
    return Notification.countDocuments({
        user: userId,
        archived: false,
        read: false,
    });
}

async function getUserNotifications(req, res, next) {
    try {
        const userId = getUserId(req);

        const filter = req.query.filter === undefined ? 'all' : req.query.filter;

        if (typeof filter !== 'string' || !ALLOWED_FILTERS.has(filter)) return res.status(400).json({ error: 'Invalid notification filter. Use all, unread, or archived.', });

        const page = parsePositiveInteger(req.query.page, 1, MAX_PAGE_NUMBER);

        const limit = parsePositiveInteger(req.query.limit, 20, MAX_PAGE_SIZE);

        if (page === null) return res.status(400).json({ error: 'Page must be a positive integer.', });

        if (limit === null) return res.status(400).json({ error: 'Limit must be a positive integer.', });

        const skip = (page - 1) * limit;

        const query = { user: userId, };

        switch (filter) {
            case 'unread':
                query.archived = false;
                query.read = false;
                break;

            case 'archived':
                query.archived = true;
                break;

            case 'all':
            default:
                query.archived = false;
                break;
        }

        const [notifications, totalCount, unreadCount] = await Promise.all([
            Notification.find(query)
                .sort({ createdAt: -1, _id: -1, })
                .skip(skip)
                .limit(limit)
                .lean(),

            Notification.countDocuments(query),

            countUnreadNotifications(userId),
        ]);

        const totalPages = Math.max(1, Math.ceil(totalCount / limit));

        return res.json({
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
        const userId = getUserId(req);

        const unreadCount = await countUnreadNotifications(userId);

        return res.json({ unreadCount });
    } catch (err) {
        next(err);
    }
}

async function updateReadStatus(req, res, next) {
    try {
        if (!isValidNotificationId(req, res)) return;

        const userId = getUserId(req);
        const { id } = req.params;
        const body = req.body || {};

        if (Object.prototype.hasOwnProperty.call(body, 'read') && typeof body.read !== 'boolean') {
            return res.status(400).json({ error: 'The read property must be a boolean.' });
        }

        const notification = await Notification.findOne({
            _id: id,
            user: userId,
        });

        if (!notification) return res.status(404).json({ error: 'Notification not found.' });

        notification.read = typeof body.read === 'boolean'
            ? body.read
            : !notification.read;

        await notification.save();

        const unreadCount = await countUnreadNotifications(userId);

        return res.json({ notification, unreadCount });
    } catch (err) {
        next(err);
    }
}

async function markAllAsRead(req, res, next) {
    try {
        const userId = getUserId(req);

        const result = await Notification.updateMany(
            {
                user: userId,
                archived: false,
                read: false,
            },
            {
                $set: {
                    read: true,
                },
            }
        );

        const unreadCount = await countUnreadNotifications(userId);

        return res.json({
            message: 'All notifications marked as read.',
            modifiedCount: result.modifiedCount,
            unreadCount,
        });
    } catch (err) {
        next(err);
    }
}

async function archiveAll(req, res, next) {
    try {
        const userId = getUserId(req);
        const archivedAt = new Date();

        const result = await Notification.updateMany(
            {
                user: userId,
                archived: false,
            },
            {
                $set: {
                    archived: true,
                    archivedAt,
                },
            }
        );

        const unreadCount = await countUnreadNotifications(userId);

        return res.json({
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
        const userId = getUserId(req);

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

        const unreadCount = await countUnreadNotifications(userId);

        return res.json({
            message: 'All notifications unarchived.',
            modifiedCount: result.modifiedCount,
            unreadCount,
        });
    } catch (err) {
        next(err);
    }
}

async function updateArchiveStatus(req, res, next) {
    try {
        if (!isValidNotificationId(req, res)) return;

        const userId = getUserId(req);
        const { id } = req.params;
        const body = req.body || {};

        if (Object.prototype.hasOwnProperty.call(body, 'archived') && typeof body.archived !== 'boolean') {
            return res.status(400).json({ error: 'The archived property must be a boolean.' });
        }

        const notification = await Notification.findOne({
            _id: id,
            user: userId,
        });

        if (!notification) return res.status(404).json({ error: 'Notification not found.' });

        const nextArchived = typeof body.archived === 'boolean'
            ? body.archived
            : !notification.archived;

        if (notification.archived === nextArchived) return res.json({ notification, unreadCount: await countUnreadNotifications(userId) });

        notification.archived = nextArchived;
        notification.archivedAt = nextArchived ? new Date() : null;

        if (nextArchived && !notification.read) {
            notification.read = true;
            notification.readAt = new Date();
        }

        await notification.save();

        const unreadCount = await countUnreadNotifications(userId);

        return res.json({ notification, unreadCount });
    } catch (err) {
        next(err);
    }
}

async function archiveAllRead(req, res, next) {
    try {
        const userId = getUserId(req);
        const archivedAt = new Date();

        const result = await Notification.updateMany(
            {
                user: userId,
                archived: false,
                read: true,
            },
            {
                $set: {
                    archived: true,
                    archivedAt,
                },
            }
        );

        const unreadCount = await countUnreadNotifications(userId);

        return res.json({
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
        if (!isValidNotificationId(req, res)) return;

        const userId = getUserId(req);
        const { id } = req.params;

        const notification = await Notification.findOneAndDelete({ _id: id, user: userId, });

        if (!notification) return res.status(404).json({ error: 'Notification not found.', });

        const unreadCount = await countUnreadNotifications(userId);

        return res.json({ message: 'Notification deleted.', unreadCount });
    } catch (err) {
        next(err);
    }
}

async function clearArchived(req, res, next) {
    try {
        const userId = getUserId(req);

        const result = await Notification.deleteMany({
            user: userId,
            archived: true,
        });

        return res.json({
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
    updateReadStatus,
    markAllAsRead,
    archiveAll,
    unarchiveAll,
    updateArchiveStatus,
    archiveAllRead,
    deleteNotification,
    clearArchived,
};