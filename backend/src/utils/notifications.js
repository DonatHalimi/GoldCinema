const Notification = require('../models/notification');

async function createNotification({ userId, title, message, type = 'system', link = null, metadata = {} }) {
    try {
        if (!userId) return null;

        const notification = await Notification.create({
            user: userId,
            title,
            message,
            type,
            link,
            metadata,
            read: false,
            archived: false,
        });

        return notification;
    } catch (err) {
        console.error('[NotificationService] Failed to create notification:', err);
        return null;
    }
}

async function notifyLogin({ userId, req, method = 'Password' }) {
    const ip = req?.headers ? (req.headers['x-forwarded-for'] || req.socket?.remoteAddress || '127.0.0.1') : '127.0.0.1';
    const userAgent = req?.headers ? (req.headers['user-agent'] || 'Browser') : 'Browser';

    return createNotification({
        userId,
        title: `${method} Login Detected`,
        message: `You successfully logged in to GoldCinema using ${method}.`,
        type: 'login',
        link: '/account/security',
        metadata: {
            method,
            ip,
            userAgent,
            time: new Date().toISOString(),
        },
    });
}

async function notifyPurchase({ userId, orderId, movieTitle = 'Movie', seats = [], amount = 0 }) {
    const seatStr = Array.isArray(seats) ? seats.join(', ') : seats;
    const formattedAmount = Number(amount || 0).toFixed(2);

    return createNotification({
        userId,
        title: 'Ticket Purchase Confirmed!',
        message: `Your booking for "${movieTitle}" (Seats: ${seatStr}) has been confirmed. Total: $${formattedAmount}`,
        type: 'purchase',
        link: '/account/tickets',
        metadata: {
            orderId,
            movieTitle,
            seats,
            amount: Number(amount || 0),
        },
    });
}

async function markNotificationAsRead(userId, notificationId, readStatus = true) {
    try {
        const notification = await Notification.findOneAndUpdate(
            { _id: notificationId, user: userId },
            { $set: { read: readStatus } },
            { new: true }
        );

        return notification;
    } catch (err) {
        console.error('[NotificationService] Failed to update read status:', err);
        return null;
    }
}

async function markAllAsReadForUser(userId) {
    try {
        const result = await Notification.updateMany(
            { user: userId, archived: false, read: false },
            { $set: { read: true } }
        );

        return result;
    } catch (err) {
        console.error('[NotificationService] Failed to mark all as read:', err);
        return null;
    }
}

async function archiveNotification(userId, notificationId, archiveStatus = true) {
    try {
        const notification = await Notification.findOneAndUpdate(
            { _id: notificationId, user: userId },
            { $set: { archived: archiveStatus } },
            { new: true }
        );

        return notification;
    } catch (err) {
        console.error('[NotificationService] Failed to update archive status:', err);
        return null;
    }
}

async function deleteNotification(userId, notificationId) {
    try {
        const result = await Notification.findOneAndDelete({ _id: notificationId, user: userId });

        return result;
    } catch (err) {
        console.error('[NotificationService] Failed to delete notification:', err);
        return null;
    }
}

async function getUnreadNotificationCount(userId) {
    try {
        return await Notification.countDocuments({
            user: userId,
            archived: false,
            read: false,
        });
    } catch (err) {
        console.error('[NotificationService] Failed to get unread count:', err);
        return 0;
    }
}

module.exports = {
    createNotification,
    notifyLogin,
    notifyPurchase,
    markNotificationAsRead,
    markAllAsReadForUser,
    archiveNotification,
    deleteNotification,
    getUnreadNotificationCount,
};
