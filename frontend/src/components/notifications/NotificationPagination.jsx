import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function NotificationPagination({ page, totalPages, totalCount, onPageChange }) {
    const { t } = useTranslation('account');

    if (totalPages <= 1) return null;

    return (
        <div className="flex items-center justify-between border-t border-marquee-line pt-4 text-xs text-marquee-muted">
            <p>
                {t('notificationsPagination.pageInfo', {
                    page,
                    totalPages,
                    totalCount,
                })}
            </p>
            <div className="flex items-center gap-2">
                <button
                    onClick={() => onPageChange((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="inline-flex items-center gap-1 rounded-lg border border-marquee-line px-3 py-1.5 font-medium transition hover:border-marquee-gold hover:text-marquee-gold disabled:opacity-40"
                >
                    <ChevronLeft size={14} /> {t('notificationsPagination.previous')}
                </button>
                <button
                    onClick={() => onPageChange((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="inline-flex items-center gap-1 rounded-lg border border-marquee-line px-3 py-1.5 font-medium transition hover:border-marquee-gold hover:text-marquee-gold disabled:opacity-40"
                >
                    {t('notificationsPagination.next')} <ChevronRight size={14} />
                </button>
            </div>
        </div>
    );
}