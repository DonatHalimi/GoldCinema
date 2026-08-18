import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function NotificationPagination({ page, totalPages, totalCount, onPageChange }) {
    if (totalPages <= 1) return null;

    return (
        <div className="flex items-center justify-between border-t border-marquee-line pt-4 text-xs text-marquee-muted">
            <p>Page {page} of {totalPages} ({totalCount} total)</p>
            <div className="flex items-center gap-2">
                <button
                    onClick={() => onPageChange((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="inline-flex items-center gap-1 rounded-lg border border-marquee-line px-3 py-1.5 font-medium transition hover:border-marquee-gold hover:text-marquee-gold disabled:opacity-40"
                >
                    <ChevronLeft size={14} /> Previous
                </button>
                <button
                    onClick={() => onPageChange((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="inline-flex items-center gap-1 rounded-lg border border-marquee-line px-3 py-1.5 font-medium transition hover:border-marquee-gold hover:text-marquee-gold disabled:opacity-40"
                >
                    Next <ChevronRight size={14} />
                </button>
            </div>
        </div>
    );
}