import NotificationFilters from './NotificationFilters';

export default function NotificationHeader({ filter, unreadCount, onFilterChange }) {
    const title = filter === 'all' ? 'All Notifications' :
        filter === 'unread' ? 'Unread Notifications' :
            'Archived Notifications';

    return (
        <div className="flex flex-col gap-4 border-b border-marquee-line pb-6 md:flex-row md:items-center md:justify-between">
            <h2 className="whitespace-nowrap font-display text-2xl font-semibold tracking-wide text-marquee-goldBright">
                {title}
            </h2>
            <NotificationFilters
                currentFilter={filter}
                onFilterChange={onFilterChange}
                unreadCount={unreadCount}
            />
        </div>
    );
}