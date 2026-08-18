import { Archive, Loader2 } from 'lucide-react';
import Modal from '../ui/Modal';

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
            <div className="mt-4">
                <p className="text-sm leading-relaxed text-zinc-400">
                    This action cannot be undone. Are you sure you
                    want to permanently delete{' '}
                    {isBulkDelete
                        ? 'all archived notifications?'
                        : 'this notification?'}
                </p>

                {title && (
                    <div className="mt-4 rounded-lg border border-red-500/20 bg-red-500/5 px-3 py-2.5">
                        <div className="flex items-center gap-2">
                            <Archive className="h-4 w-4 text-red-500" />

                            <p className="text-xs text-zinc-500">
                                {isBulkDelete
                                    ? 'Archived Notifications'
                                    : 'Notification'}
                            </p>
                        </div>

                        <p className="mt-1 truncate text-sm font-medium text-marquee-cream">
                            {isBulkDelete
                                ? 'All archived notifications'
                                : title}
                        </p>
                    </div>
                )}
            </div>

            <div className="mt-8 flex justify-end gap-3">
                <button
                    type="button"
                    onClick={onCancel}
                    disabled={deleting}
                    className="rounded-full border border-marquee-line px-4 py-2 text-sm text-marquee-muted transition hover:border-marquee-gold hover:text-marquee-cream disabled:cursor-not-allowed disabled:opacity-50"
                >
                    Cancel
                </button>

                <button
                    type="button"
                    onClick={onConfirm}
                    disabled={deleting}
                    className="inline-flex items-center gap-2 rounded-full bg-red-600 px-5 py-2 text-sm font-semibold text-white transition hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-50"
                >
                    {deleting && (
                        <Loader2 className="h-4 w-4 animate-spin" />
                    )}

                    {deleting
                        ? 'Deleting...'
                        : 'Delete'}
                </button>
            </div>
        </Modal>
    );
}