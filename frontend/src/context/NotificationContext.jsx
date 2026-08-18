import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useState,
} from 'react';
import api from '../api/client';

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
            const response = await api.get('/notifications', {
                params: {
                    filter,
                    page,
                    limit: 20,
                },
            });

            const data = response.data;

            setNotifications(data.notifications || []);
            setTotalCount(data.totalCount || 0);
            setUnreadCount(data.unreadCount || 0);
            setTotalPages(data.totalPages || 1);
        } catch (error) {
            console.error('[NOTIFICATIONS] Failed to fetch notifications:', error.response?.data || error.message);
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
            const response = await api.patch(`/notifications/${id}/read`, { read });

            const updatedNotification = response.data.notification;

            setNotifications((current) =>
                current.map((notification) =>
                    notification._id === id
                        ? updatedNotification
                        : notification
                )
            );

            if (typeof response.data.unreadCount === 'number') {
                setUnreadCount(response.data.unreadCount);
            }
        } catch (error) {
            console.error('[NOTIFICATIONS] Failed to update read status:', error.response?.data || error.message);
        }
    }, []);

    const markAllAsRead = useCallback(async () => {
        try {
            const response = await api.patch('/notifications/read-all');

            setUnreadCount(response.data.unreadCount ?? 0);

            setNotifications((current) =>
                current.map((notification) =>
                    notification.archived === false ? {
                        ...notification,
                        read: true,
                    }
                        : notification
                )
            );

            await fetchNotifications();
        } catch (error) {
            console.error('[NOTIFICATIONS] Failed to mark all as read:', error.response?.data || error.message);
        }
    }, [fetchNotifications]);

    const toggleArchive = useCallback(
        async (id, archived) => {
            try {
                const response = await api.patch(`/notifications/${id}/archive`, { archived });

                if (typeof response.data.unreadCount === 'number') {
                    setUnreadCount(response.data.unreadCount);
                }

                await fetchNotifications();
            } catch (error) {
                console.error('[NOTIFICATIONS] Failed to update archive status:', error.response?.data || error.message);
            }
        },
        [fetchNotifications]
    );

    const archiveAllRead = useCallback(async () => {
        try {
            const response = await api.patch('/notifications/archive-all-read');

            if (typeof response.data.unreadCount === 'number') {
                setUnreadCount(response.data.unreadCount);
            }

            await fetchNotifications();
        } catch (error) {
            console.error('[NOTIFICATIONS] Failed to archive all read notifications:', error.response?.data || error.message);
        }
    }, [fetchNotifications]);

    const archiveAll = useCallback(async () => {
        try {
            const response = await api.patch('/notifications/archive-all');

            if (typeof response.data.unreadCount === 'number') {
                setUnreadCount(response.data.unreadCount);
            }

            await fetchNotifications();
        } catch (error) {
            console.error('[NOTIFICATIONS] Failed to archive all notifications:', error.response?.data || error.message);
        }
    }, [fetchNotifications]);

    const unarchiveAll = useCallback(async () => {
        try {
            const response = await api.patch('/notifications/unarchive-all');

            if (typeof response.data.unreadCount === 'number') {
                setUnreadCount(response.data.unreadCount);
            }

            setFilter('all');
            setPage(1);
        } catch (error) {
            console.error('[NOTIFICATIONS] Failed to unarchive all notifications:', error.response?.data || error.message);
        }
    }, []);

    const deleteNotification = useCallback(
        async (id) => {

            if (!id) return false;

            const notificationId = String(id);

            try {
                const response = await api.delete(`/notifications/${notificationId}`);

                setNotifications((current) => {
                    const exists = current.some(
                        (notification) =>
                            String(notification._id) === notificationId
                    );

                    const updated = current.filter(
                        (notification) =>
                            String(notification._id) !== notificationId
                    );

                    return updated;
                });

                await fetchNotifications();

                return true;
            } catch (error) {
                console.error('[NOTIFICATIONS] Failed to delete notification:', error.response?.data || error.message);
                throw error;
            }
        },
        [fetchNotifications]
    );

    const clearArchived = useCallback(async () => {
        try {
            await api.delete('/notifications/clear-archived');
            await fetchNotifications();
        } catch (error) {
            console.error('[NOTIFICATIONS] Failed to clear archived notifications:', error.response?.data || error.message);
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