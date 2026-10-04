import { Archive, ArchiveRestore, CheckCheck, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import DeleteNotificationModal from './DeleteNotificationModal';

export default function NotificationToolbar({
    filter,
    unreadCount,
    notificationsCount,
    notifications = [],
    onMarkAllRead,
    onArchiveAllRead,
    onArchiveAll,
    onUnarchiveAll,
    onClearArchived,
}) {
    const { t } = useTranslation('account');
    const [showClearArchivedPopup, setShowClearArchivedPopup] = useState(false);

    const hasReadNotifications = notifications.some(
        (notification) => notification.read === true
    );

    const hasNotifications = notificationsCount > 0;

    const handleClearArchivedClick = () => setShowClearArchivedPopup(true);

    const handleConfirmClearArchived = () => {
        onClearArchived();
        setShowClearArchivedPopup(false);
    };

    const handleCancelClearArchived = () => setShowClearArchivedPopup(false);

    return (
        <div className="flex items-center justify-between text-xs">
            <p className="my-4 font-medium text-marquee-muted">
                {t('showingNotifications2')} {notificationsCount}{' '}
                {filter === 'all' ? t('activeNotifications') : filter} {t('notificationLabel')}
                {notificationsCount === 1 ? '' : t('pluralNotifications')}
            </p>

            <div className="my-4 flex items-center gap-2">
                {filter !== 'archived' && unreadCount > 0 && (
                    <button
                        type="button"
                        onClick={onMarkAllRead}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-marquee-line bg-marquee-panel px-3 py-1.5 font-medium text-marquee-cream transition hover:border-marquee-gold hover:text-marquee-gold"
                    >
                        <CheckCheck size={14} />
                        {t('markAllAsRead')}
                    </button>
                )}

                {filter !== 'archived' && hasNotifications && hasReadNotifications && (
                    <button
                        type="button"
                        onClick={onArchiveAllRead}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-marquee-line bg-marquee-panel px-3 py-1.5 font-medium text-marquee-cream transition hover:border-marquee-gold hover:text-marquee-gold"
                    >
                        <Archive size={14} />
                        {t('archiveRead')}
                    </button>
                )}

                {filter !== 'archived' && hasNotifications && (
                    <button
                        type="button"
                        onClick={onArchiveAll}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-marquee-line bg-marquee-panel px-3 py-1.5 font-medium text-marquee-cream transition hover:border-marquee-gold hover:text-marquee-gold"
                    >
                        <Archive size={14} />
                        {t('archiveAll')}
                    </button>
                )}

                {filter === 'archived' && hasNotifications && (
                    <button
                        type="button"
                        onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            onUnarchiveAll();
                        }}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-marquee-line bg-marquee-panel px-3 py-1.5 font-medium text-marquee-cream transition hover:border-marquee-gold hover:text-marquee-gold"
                    >
                        <ArchiveRestore size={14} />
                        {t('unarchiveAll')}
                    </button>
                )}

                {filter === 'archived' && hasNotifications && (
                    <div className="relative">
                        <button
                            type="button"
                            onClick={handleClearArchivedClick}
                            className="inline-flex items-center gap-1.5 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-1.5 font-medium text-red-400 transition hover:bg-red-500/20"
                        >
                            <Trash2 size={14} />
                            {t('clearArchived')}
                        </button>

                        <DeleteNotificationModal
                            isOpen={showClearArchivedPopup}
                            onConfirm={handleConfirmClearArchived}
                            onCancel={handleCancelClearArchived}
                            title={t('allArchivedNotifications')}
                        />
                    </div>
                )}
            </div>
        </div>
    );
}