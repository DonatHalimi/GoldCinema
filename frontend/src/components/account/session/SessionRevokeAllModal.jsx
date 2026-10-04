import { AlertTriangle, Loader2 } from 'lucide-react';
import Modal from '../../ui/modals/Modal';

export default function SessionRevokeAllModal({
    isOpen,
    count,
    loading,
    onCancel,
    onConfirm,
}) {
    return (
        <Modal
            isOpen={isOpen}
            onClose={onCancel}
            title="Log out everywhere else?"
            closeDisabled={loading}
        >
            <div className="mt-5">
                <div className="flex items-start gap-3 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3">
                    <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-red-400" />

                    <div>
                        <p className="text-sm font-semibold text-red-400">
                            Revoke other sessions
                        </p>

                        <p className="mt-1 text-sm text-red-300/90">
                            This will immediately revoke{' '}
                            <span className="font-semibold text-red-200">
                                {count} other session
                                {count !== 1 ? 's' : ''}
                            </span>
                            . Anyone using those sessions will need to sign
                            in again.
                        </p>
                    </div>
                </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
                <button
                    type="button"
                    onClick={onCancel}
                    disabled={loading}
                    className="rounded-full border border-marquee-line px-4 py-2 text-sm text-marquee-muted transition-colors hover:border-marquee-gold hover:text-marquee-cream disabled:cursor-not-allowed disabled:opacity-50"
                >
                    Cancel
                </button>

                <button
                    id="confirm-revoke-all"
                    type="button"
                    onClick={onConfirm}
                    disabled={loading}
                    className="inline-flex items-center gap-2 rounded-full bg-red-500/90 px-5 py-2 text-sm font-semibold text-white transition-all hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-40"
                >
                    {loading && (
                        <Loader2 className="h-4 w-4 animate-spin" />
                    )}

                    {loading ? 'Logging out...' : 'Log out all others'}
                </button>
            </div>
        </Modal>
    );
}