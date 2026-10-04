import { AnimatePresence } from 'framer-motion';
import { Archive, Bell, MailCheck, RefreshCw } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import NotificationItem from './NotificationItem';

export default function NotificationList({
    notifications,
    loading,
    filter,
    onMarkRead,
    onToggleArchive,
    onDelete,
    onDeleteRequest,
}) {
    const { t } = useTranslation('account');

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-12 text-marquee-muted">
                <RefreshCw size={24} className="mb-2 animate-spin text-marquee-gold" />
                <p className="text-sm">
                    {t('loadingNotifications')}
                </p>
            </div>
        );
    }

    if (notifications.length === 0) {
        return (
            <div className="rounded-xl border border-dashed border-marquee-line bg-marquee-bg p-12 text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-marquee-bg text-marquee-gold">
                    {filter === 'archived' ? <Archive size={24} className="mx-auto mb-3 h-10 w-10 text-marquee-goldDim" /> :
                        filter === 'unread' ? <MailCheck size={24} className="mx-auto mb-3 h-10 w-10 text-marquee-goldDim" /> :
                            <Bell size={24} className="mx-auto mb-3 h-10 w-10 text-marquee-goldDim" />}
                </div>
                <p className="font-serif text-xl text-marquee-cream">
                    {filter === 'archived' ? t('noArchivedNotifications') : filter === 'unread' ? t('noUnreadNotifications') : t('noNotifications')}
                </p>
                <p className="mt-1 text-sm text-marquee-muted">
                    {filter === 'archived' ? t('archivedEmptyDescription') : filter === 'unread' ? t('unreadEmptyDescription') : t('emptyDescription')}
                </p>
            </div>
        );
    }

    return (
        <AnimatePresence mode="popLayout">
            {notifications.map((item) => (
                <NotificationItem
                    key={item._id}
                    notification={item}
                    onMarkRead={onMarkRead}
                    onToggleArchive={onToggleArchive}
                    onDelete={onDelete}
                    onDeleteRequest={onDeleteRequest}
                />
            ))}
        </AnimatePresence>
    );
}