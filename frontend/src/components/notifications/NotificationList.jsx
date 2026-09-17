import { AnimatePresence } from 'framer-motion';
import { Archive, Bell, MailCheck, RefreshCw } from 'lucide-react';
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
    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-12 text-marquee-muted">
                <RefreshCw size={24} className="animate-spin mb-2 text-marquee-gold" />
                <p className="text-sm">Loading notifications...</p>
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
                    {filter === 'archived' ? 'No archived notifications' :
                        filter === 'unread' ? 'No unread notifications' :
                            'No notifications yet'}
                </p>
                <p className="mt-1 text-sm text-marquee-muted">
                    {filter === 'archived'
                        ? 'Archived notifications will be stored here for future reference.'
                        : filter === 'unread'
                            ? 'You have read all your notifications.'
                            : 'Notifications regarding ticket purchases and login activity will appear here.'}
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