import { Bell, Shield, Tag, Ticket } from 'lucide-react';

export const FILTERS = [
    { label: 'All', value: 'all' },
    { label: 'Unread', value: 'unread' },
    { label: 'Archived', value: 'archived' },
];

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