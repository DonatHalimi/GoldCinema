import { Loader2 } from 'lucide-react';
import Modal from './Modal';

export default function DeleteConfirmModal({
    deleteTarget,
    label,
    deleting,
    onClose,
    onConfirm,
}) {
    if (!deleteTarget) return null;

    const isBulkDelete = Array.isArray(deleteTarget);

    const title = isBulkDelete
        ? `Delete ${deleteTarget.length} Records`
        : `Delete ${label?.slice(0, -1)}`;

    const message = isBulkDelete
        ? `Are you sure you want to delete these ${deleteTarget.length} selected items? This action cannot be undone.`
        : 'This action cannot be undone. Are you sure you want to permanently delete this record?';

    return (
        <Modal
            isOpen
            onClose={onClose}
            title={title}
            closeDisabled={deleting}
        >
            <p className="mt-4 text-sm text-zinc-400">
                {message}
            </p>

            <div className="mt-8 flex justify-end gap-3">
                <button
                    type="button"
                    onClick={onClose}
                    disabled={deleting}
                    className="rounded-full border border-marquee-line px-4 py-2 text-sm text-marquee-muted transition hover:border-marquee-gold disabled:opacity-50"
                >
                    Cancel
                </button>

                <button
                    type="button"
                    onClick={onConfirm}
                    disabled={deleting}
                    className="inline-flex items-center gap-2 rounded-full bg-red-600 px-5 py-2 text-sm font-semibold text-white transition hover:bg-red-500 disabled:opacity-50"
                >
                    {deleting && <Loader2 className="h-4 w-4 animate-spin" />}

                    {deleting ? 'Deleting...' : 'Delete'}
                </button>
            </div>
        </Modal>
    );
}