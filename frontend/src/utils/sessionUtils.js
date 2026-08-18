export function timeAgo(dateStr) {
    if (!dateStr) return 'Unknown';

    const diff = Date.now() - new Date(dateStr).getTime();
    const seconds = Math.floor(diff / 1000);

    if (seconds < 60) return 'Just now';

    const minutes = Math.floor(seconds / 60);

    if (minutes < 60) return `${minutes} minute${minutes !== 1 ? 's' : ''} ago`;

    const hours = Math.floor(minutes / 60);

    if (hours < 24) return `${hours} hour${hours !== 1 ? 's' : ''} ago`;

    const days = Math.floor(hours / 24);

    if (days < 30) return `${days} day${days !== 1 ? 's' : ''} ago`;

    return new Date(dateStr).toLocaleDateString('en-GB');
}

export function formatSessionDate(dateStr) {
    if (!dateStr) return '—';

    return new Date(dateStr).toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
    });
}

export function isMobileUserAgent(userAgent) {
    if (!userAgent) return false;

    return /Mobi|Android|iPhone|iPad|iPod/.test(userAgent);
}