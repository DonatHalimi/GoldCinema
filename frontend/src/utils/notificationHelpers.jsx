import { Bell, Shield, Tag, Ticket } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export const useNotificationFilters = () => {
    const { t } = useTranslation('account');

    return [
        { label: t('allNotifications2'), value: 'all' },
        { label: t('unreadNotifications2'), value: 'unread' },
        { label: t('archivedNotifications2'), value: 'archived' },
    ];
};

export const getTypeIcon = (type) => {
    switch (type) {
        case 'purchase': return Ticket;
        case 'login': return Shield;
        case 'promo': return Tag;
        default: return Bell;
    }
};

export const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
};