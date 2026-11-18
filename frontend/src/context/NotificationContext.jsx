import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useState,
} from 'react';
import {
    archiveAllReadNotifications,
    clearArchivedNotifications,
    deleteUserNotification,
    getNotifications,
    markAllNotificationsAsArchived,
    markAllNotificationsAsRead,
    markAllNotificationsAsUnarchived,
    markNotificationAsRead,
    updateNotificationArchive,
} from '../api/notifications';

const NotificationContext = createContext(null);

export function NotificationProvider({ children }) {
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [totalCount, setTotalCount] = useState(0);
    const [totalPages, setTotalPages] = useState(1);

    const [filter, setFilter] = useState('all');
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(false);

    const fetchNotifications = useCallback(async () => {
        setLoading(true);

        try {
            const data = await getNotifications(filter, page, 20);

            setNotifications(data.notifications || []);
            setTotalCount(data.totalCount || 0);
            setUnreadCount(data.unreadCount || 0);
            setTotalPages(data.totalPages || 1);
        } catch (error) {
            console.error(
                '[NOTIFICATIONS] Failed to fetch notifications:',
                error.response?.data || error.message
            );
            setNotifications([]);
            setTotalCount(0);
            setTotalPages(1);
        } finally {
            setLoading(false);
        }
    }, [filter, page]);

    useEffect(() => {
        fetchNotifications();
    }, [fetchNotifications]);

    const handleSetFilter = useCallback((newFilter) => {
        setFilter(newFilter);
        setPage(1);
    }, []);

    const handleSetPage = useCallback((newPage) => {
        setPage(newPage);
    }, []);

    const markAsRead = useCallback(async (id, read = true) => {
        try {
            const data = await markNotificationAsRead(id, read);
            const updatedNotification = data.notification;

            setNotifications((current) =>
                current.map((notification) => notification._id === id ? updatedNotification : notification
                )
            );

            if (typeof data.unreadCount === 'number') {
                setUnreadCount(data.unreadCount);
            }
        } catch (error) {
            console.error(
                '[NOTIFICATIONS] Failed to update read status:',
                error.response?.data || error.message
            );
        }
    }, []);

    const markAllAsRead = useCallback(async () => {
        try {
            const data = await markAllNotificationsAsRead();

            setUnreadCount(data.unreadCount ?? 0);

            setNotifications((current) =>
                current.map((notification) =>
                    notification.archived === false
                        ? { ...notification, read: true }
                        : notification
                )
            );

            await fetchNotifications();
        } catch (error) {
            console.error(
                '[NOTIFICATIONS] Failed to mark all as read:',
                error.response?.data || error.message
            );
        }
    }, [fetchNotifications]);

    const archiveNotification = useCallback(
        async (id, archived = true) => {
            if (!id) return false;

            const previous = notifications;

            if (archived) {
                setNotifications((current) =>
                    current.filter((n) => String(n._id) !== String(id))
                );

                const item = previous.find(
                    (n) => String(n._id) === String(id)
                );
                if (item && !item.read) {
                    setUnreadCount((count) => Math.max(0, count - 1));
                }
            }

            try {
                const data = await updateNotificationArchive(id, archived);

                if (typeof data?.unreadCount === 'number') {
                    setUnreadCount(data.unreadCount);
                }

                await fetchNotifications();
                return true;
            } catch (error) {
                setNotifications(previous);
                console.error(
                    '[NOTIFICATIONS] Failed to update archive status:',
                    error.response?.data || error.message
                );
                return false;
            }
        },
        [notifications, fetchNotifications]
    );

    const toggleArchive = archiveNotification;

    const unarchiveNotification = useCallback(
        (id) => archiveNotification(id, false),
        [archiveNotification]
    );

    const archiveAllRead = useCallback(async () => {
        try {
            const data = await archiveAllReadNotifications();

            if (typeof data.unreadCount === 'number') {
                setUnreadCount(data.unreadCount);
            }

            await fetchNotifications();
        } catch (error) {
            console.error(
                '[NOTIFICATIONS] Failed to archive all read notifications:',
                error.response?.data || error.message
            );
        }
    }, [fetchNotifications]);

    const archiveAll = useCallback(async () => {
        try {
            const data = await markAllNotificationsAsArchived();

            if (typeof data.unreadCount === 'number') {
                setUnreadCount(data.unreadCount);
            }

            await fetchNotifications();
        } catch (error) {
            console.error(
                '[NOTIFICATIONS] Failed to archive all notifications:',
                error.response?.data || error.message
            );
        }
    }, [fetchNotifications]);

    const unarchiveAll = useCallback(async () => {
        try {
            const data = await markAllNotificationsAsUnarchived();

            if (typeof data.unreadCount === 'number') {
                setUnreadCount(data.unreadCount);
            }

            setFilter('all');
            setPage(1);
        } catch (error) {
            console.error(
                '[NOTIFICATIONS] Failed to unarchive all notifications:',
                error.response?.data || error.message
            );
        }
    }, []);

    const deleteNotification = useCallback(
        async (id) => {
            if (!id) return false;

            const previous = notifications;

            setNotifications((current) =>
                current.filter((n) => String(n._id) !== String(id))
            );

            try {
                await deleteUserNotification(id);

                const removed = previous.find(
                    (n) => String(n._id) === String(id)
                );

                if (removed && !removed.read && !removed.archived) {
                    setUnreadCount((count) => Math.max(0, count - 1));
                }

                await fetchNotifications();
                return true;
            } catch (error) {
                setNotifications(previous);
                console.error(
                    '[NOTIFICATIONS] Failed to delete notification:',
                    error.response?.data || error.message
                );
                throw error;
            }
        },
        [notifications, fetchNotifications]
    );

    const clearArchived = useCallback(async () => {
        try {
            await clearArchivedNotifications();
            await fetchNotifications();
        } catch (error) {
            console.error(
                '[NOTIFICATIONS] Failed to clear archived notifications:',
                error.response?.data || error.message
            );
        }
    }, [fetchNotifications]);

    const value = {
        notifications,
        unreadCount,
        totalCount,
        totalPages,
        filter,
        page,
        loading,

        setFilter: handleSetFilter,
        setPage: handleSetPage,

        markAsRead,
        markAllAsRead,

        archiveNotification,
        unarchiveNotification,
        toggleArchive,
        archiveAllRead,
        archiveAll,
        unarchiveAll,

        deleteNotification,
        clearArchived,

        fetchNotifications,
    };

    return (
        <NotificationContext.Provider value={value}>
            {children}
        </NotificationContext.Provider>
    );
}

export function useNotifications() {
    const context = useContext(NotificationContext);
    if (!context) {
        throw new Error('useNotifications must be used inside NotificationProvider');
    }
    return context;
}

export default NotificationContext;