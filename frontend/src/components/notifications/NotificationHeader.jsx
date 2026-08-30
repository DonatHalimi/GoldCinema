import NotificationFilters from './NotificationFilters';

export default function NotificationHeader({
    filter,
    unreadCount,
    onFilterChange,
}) {
    const title =
        filter === 'all'
            ? 'All Notifications'
            : filter === 'unread'
                ? 'Unread Notifications'
                : 'Archived Notifications';

    const description =
        filter === 'archived'
            ? 'Archived notifications will be automatically deleted after 30 days'
            : 'Manage your notifications and preferences';

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