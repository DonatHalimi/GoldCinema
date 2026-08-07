import { X } from 'lucide-react';

export default function DeleteConfirmModal({
    deleteTarget,
    label,
    deleting,
    onClose,
    onConfirm,
}) {
    if (!deleteTarget) return null;

    const isBulkDelete = Array.isArray(deleteTarget);

    return (
        <div
            onClick={() => !deleting && onClose()}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
        >
            <div
                onClick={(e) => e.stopPropagation()}
                className="relative w-full max-w-md rounded-xl border border-zinc-800 bg-zinc-900 p-6 shadow-2xl"
            >
                <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                    <h2 className="font-display text-2xl text-marquee-gold">
                        {isBulkDelete
                            ? `Delete ${deleteTarget.length} Records`
                            : `Delete ${label?.slice(0, -1)}`}
                    </h2>

                    <button
                        onClick={onClose}
                        disabled={deleting}
                        className="flex h-7 w-7 items-center justify-center rounded-lg text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-zinc-100 disabled:opacity-50"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>

                <p className="mt-4 text-sm text-zinc-400">
                    {isBulkDelete
                        ? `Are you sure you want to delete these ${deleteTarget.length} selected items? This action cannot be undone.`
                        : `This action cannot be undone. Are you sure you want to permanently delete this record?`}
                </p>

                <div className="mt-8 flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        disabled={deleting}
                        className="rounded-lg border border-zinc-700 px-4 py-2 text-zinc-300 transition-colors hover:bg-zinc-800 disabled:opacity-50"
                    >
                        Cancel
                    </button>

                    <button
                        onClick={onConfirm}
                        disabled={deleting}
                        className="rounded-lg bg-red-600 px-4 py-2 font-semibold text-white shadow-[0_0_12px_rgba(220,38,38,0.2)] transition-colors hover:bg-red-500 disabled:opacity-50"
                    >
                        {deleting ? 'Deleting...' : 'Delete'}
                    </button>
                </div>
            </div>
        </div>
    );
}