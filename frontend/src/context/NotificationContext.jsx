import { createContext, useCallback, useContext, useState } from 'react';
import { useAuth } from './AuthContext';
import {
    useArchiveAllNotificationsMutation,
    useArchiveAllReadNotificationsMutation,
    useClearArchivedNotificationsMutation,
    useDeleteNotificationMutation,
    useGetNotificationsQuery,
    useMarkAllNotificationsAsReadMutation,
    useMarkNotificationAsReadMutation,
    useUnarchiveAllNotificationsMutation,
    useUpdateNotificationArchiveMutation,
} from '../store/api/notificationsApiSlice';

const NotificationContext = createContext(null);

export function NotificationProvider({ children }) {
    const { user } = useAuth();
    const [filter, setFilter] = useState('all');
    const [page, setPage] = useState(1);
    const query = useGetNotificationsQuery(
        { filter, page, limit: 20 },
        { skip: !user }
    );
    const [markRead] = useMarkNotificationAsReadMutation();
    const [markAllRead] = useMarkAllNotificationsAsReadMutation();
    const [updateArchive] = useUpdateNotificationArchiveMutation();
    const [archiveRead] = useArchiveAllReadNotificationsMutation();
    const [archiveAllRequest] = useArchiveAllNotificationsMutation();
    const [unarchiveAllRequest] = useUnarchiveAllNotificationsMutation();
    const [deleteRequest] = useDeleteNotificationMutation();
    const [clearArchivedRequest] = useClearArchivedNotificationsMutation();

    const result = query.data || {};
    const notifications = result.notifications || [];
    const unreadCount = result.unreadCount || 0;
    const totalCount = result.totalCount || 0;
    const totalPages = result.totalPages || 1;
    const loading = Boolean(user && query.isFetching);

    const handleSetFilter = useCallback((nextFilter) => {
        setFilter(nextFilter);
        setPage(1);
    }, []);

    async function fetchNotifications() {
        if (!user) return { data: {} };
        const result = await query.refetch();
        if (result.isError) throw result.error;
        return result;
    }

    const markAsRead = useCallback((id, read = true) => (
        markRead({ id, read }).unwrap()
    ), [markRead]);

    const markAllAsRead = useCallback(async () => {
        try {
            await markAllRead().unwrap();
        } catch (error) {
            console.error('[NOTIFICATIONS] Failed to mark all as read:', error);
        }
    }, [markAllRead]);

    const archiveNotification = useCallback(async (id, archived = true) => {
        if (!id) return false;
        try {
            await updateArchive({ id, archived }).unwrap();
            return true;
        } catch (error) {
            console.error('[NOTIFICATIONS] Failed to update archive status:', error);
            return false;
        }
    }, [updateArchive]);

    const unarchiveNotification = useCallback((id) => archiveNotification(id, false), [archiveNotification]);

    const archiveAllRead = useCallback(async () => {
        try {
            await archiveRead().unwrap();
        } catch (error) {
            console.error('[NOTIFICATIONS] Failed to archive all read notifications:', error);
        }
    }, [archiveRead]);

    const archiveAll = useCallback(async () => {
        try {
            await archiveAllRequest().unwrap();
        } catch (error) {
            console.error('[NOTIFICATIONS] Failed to archive all notifications:', error);
        }
    }, [archiveAllRequest]);

    const unarchiveAll = useCallback(async () => {
        try {
            await unarchiveAllRequest().unwrap();
            handleSetFilter('all');
        } catch (error) {
            console.error('[NOTIFICATIONS] Failed to unarchive all notifications:', error);
        }
    }, [handleSetFilter, unarchiveAllRequest]);

    const deleteNotification = useCallback((id) => deleteRequest(id).unwrap(), [deleteRequest]);

    const clearArchived = useCallback(async () => {
        try {
            await clearArchivedRequest().unwrap();
        } catch (error) {
            console.error('[NOTIFICATIONS] Failed to clear archived notifications:', error);
        }
    }, [clearArchivedRequest]);

    return (
        <NotificationContext.Provider value={{
            notifications,
            unreadCount,
            totalCount,
            totalPages,
            filter,
            page,
            loading,
            setFilter: handleSetFilter,
            setPage,
            markAsRead,
            markAllAsRead,
            archiveNotification,
            unarchiveNotification,
            toggleArchive: archiveNotification,
            archiveAllRead,
            archiveAll,
            unarchiveAll,
            deleteNotification,
            clearArchived,
            fetchNotifications,
        }}>
            {children}
        </NotificationContext.Provider>
    );
}

export function useNotifications() {
    const context = useContext(NotificationContext);
    if (!context) throw new Error('useNotifications must be used inside NotificationProvider');
    return context;
}

export default NotificationContext;
