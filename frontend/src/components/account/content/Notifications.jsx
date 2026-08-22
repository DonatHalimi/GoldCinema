import { useEffect, useState } from 'react';
import { useNotifications } from '../../../context/NotificationContext';
import DeleteNotificationModal from '../../notifications/DeleteNotificationModal';
import NotificationHeader from '../../notifications/NotificationHeader';
import NotificationList from '../../notifications/NotificationList';
import NotificationPagination from '../../notifications/NotificationPagination';
import NotificationToolbar from '../../notifications/NotificationToolbar';

export default function Notifications() {
    const {
        notifications,
        unreadCount,
        totalCount,
        totalPages,
        filter,
        page,
        loading,
        setFilter,
        setPage,
        fetchNotifications,
        markAsRead,
        markAllAsRead,
        toggleArchive,
        archiveAllRead,
        archiveAll,
        unarchiveAll,
        deleteNotification,
        clearArchived,
    } = useNotifications();

    const [deleteTarget, setDeleteTarget] = useState(null);
    const [deleting, setDeleting] = useState(false);

    useEffect(() => {
        fetchNotifications();
    }, []);

    const handleDeleteRequest = (id, title) => {
        setDeleteTarget({ id, title });
    };

    const handleConfirmDelete = async () => {
        if (!deleteTarget?.id || deleting) return;

        try {
            setDeleting(true);

            await deleteNotification(deleteTarget.id);

            setDeleteTarget(null);
        } catch (error) {
            console.error('[Notifications] Delete failed:', error);
        } finally {
            setDeleting(false);
        }
    };

    const handleCancelDelete = () => {
        if (deleting) return;

        setDeleteTarget(null);
    };

    return (
        <div>
            <main className="flex-1 rounded-xl bg-marquee-panel">
                <NotificationHeader
                    filter={filter}
                    unreadCount={unreadCount}
                    onFilterChange={setFilter}
                />

                <NotificationToolbar
                    filter={filter}
                    unreadCount={unreadCount}
                    notificationsCount={notifications.length}
                    notifications={notifications}
                    onMarkAllRead={markAllAsRead}
                    onArchiveAllRead={archiveAllRead}
                    onArchiveAll={archiveAll}
                    onUnarchiveAll={unarchiveAll}
                    onClearArchived={clearArchived}
                />

                <div className="flex flex-col gap-4">
                    <NotificationList
                        notifications={notifications}
                        loading={loading}
                        filter={filter}
                        onMarkRead={markAsRead}
                        onToggleArchive={toggleArchive}
                        onDeleteRequest={handleDeleteRequest}
                    />
                </div>

                <NotificationPagination
                    page={page}
                    totalPages={totalPages}
                    totalCount={totalCount}
                    onPageChange={setPage}
                />
            </main>

            <DeleteNotificationModal
                isOpen={Boolean(deleteTarget)}
                onConfirm={handleConfirmDelete}
                onCancel={handleCancelDelete}
                title={deleteTarget?.title}
                deleting={deleting}
            />
        </div>
    );
}