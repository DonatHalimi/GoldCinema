import { Archive, Loader2, TriangleAlert } from 'lucide-react';
import Modal from '../ui/modals/Modal';

export default function DeleteNotificationModal({
    isOpen,
    onConfirm,
    onCancel,
    title,
    deleting = false,
}) {
    const isBulkDelete = title === 'all archived notifications';

    return (
        <Modal
            isOpen={isOpen}
            onClose={onCancel}
            closeDisabled={deleting}
            title={
                isBulkDelete
                    ? 'Delete Archived Notifications'
                    : 'Delete Notification'
            }
        >
            <div className="mt-5 rounded-lg border border-red-500/20 bg-red-500/5 p-4">
                <div className="flex items-center gap-2">
                    <TriangleAlert className="h-4 w-4 shrink-0 text-red-400" />
                    <p className="text-sm font-semibold text-red-400">
                        This action cannot be undone.
                    </p>
                </div>

                <p className="mt-2 text-sm leading-relaxed text-marquee-muted">
                    Are you sure you want to permanently delete{' '}
                    {isBulkDelete
                        ? 'all archived notifications?'
                        : 'this notification?'}
                </p>
            </div>

            {title && (
                <div className="mt-5 rounded-lg border border-marquee-line bg-marquee-panel2 p-4">
                    <div className="flex items-center gap-2">
                        <Archive className="h-4 w-4 shrink-0 text-marquee-gold" />

                        <p className="text-xs font-medium uppercase tracking-wide text-marquee-muted">
                            {isBulkDelete
                                ? 'Archived Notifications'
                                : 'Notification'}
                        </p>
                    </div>

                    <p className="mt-2 truncate text-sm font-semibold text-marquee-cream">
                        {isBulkDelete
                            ? 'All archived notifications'
                            : title}
                    </p>
                </div>
            )}

            <div className="mt-7 flex justify-end gap-3">
                <button
                    type="button"
                    onClick={onCancel}
                    disabled={deleting}
                    className="rounded-full border border-marquee-line px-4 py-2 text-sm text-marquee-muted transition-colors hover:border-marquee-gold hover:text-marquee-cream disabled:cursor-not-allowed disabled:opacity-50"
                >
                    Cancel
                </button>

                <button
                    type="button"
                    onClick={onConfirm}
                    disabled={deleting}
                    className="inline-flex items-center gap-2 rounded-full bg-red-600 px-5 py-2 text-sm font-semibold text-white transition-all hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-40"
                >
                    {deleting && (
                        <Loader2 className="h-4 w-4 animate-spin" />
                    )}

                    {deleting ? 'Deleting...' : 'Delete'}
                </button>
            </div>
        </Modal>
    );
}