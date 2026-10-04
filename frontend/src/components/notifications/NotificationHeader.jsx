import { useTranslation } from 'react-i18next';
import NotificationFilters from './NotificationFilters';

export default function NotificationHeader({
    filter,
    unreadCount,
    onFilterChange,
}) {
    const { t } = useTranslation('account');

    const title =
        filter === 'all'
            ? t('allNotifications')
            : filter === 'unread'
                ? t('unreadNotifications')
                : t('archivedNotifications');

    const description =
        filter === 'archived'
            ? t('archivedDesc')
            : t('notificationDesc');

    return (
        <div className="flex flex-col gap-4 border-b border-marquee-line pb-6 md:flex-row md:items-center md:justify-between">
            <div>
                <h2 className="font-display text-2xl font-semibold tracking-wide text-marquee-goldBright">
                    {title}
                </h2>
                <p className="mt-1 text-sm text-marquee-muted">
                    {description}
                </p>
            </div>

            <NotificationFilters
                currentFilter={filter}
                onFilterChange={onFilterChange}
                unreadCount={unreadCount}
            />
        </div>
    );
}