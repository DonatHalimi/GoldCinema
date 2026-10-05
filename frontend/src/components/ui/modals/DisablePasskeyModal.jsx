import { startAuthentication } from '@simplewebauthn/browser';
import {
    Fingerprint,
    Loader2,
    Trash2,
    TriangleAlert,
    X
} from 'lucide-react';
import { useState } from 'react';
import { toast } from 'react-toastify';
import {
    deletePasskey,
    getPasskeyRemovalChallenge,
} from '../../../api/auth';
import Modal from './Modal';

export default function DisablePasskeyModal({
    id,
    passkeyName,
    onClose,
    onSuccess,
}) {
    const [deleting, setDeleting] = useState(false);

    const handleDelete = async () => {
        try {
            setDeleting(true);

            const options = await getPasskeyRemovalChallenge(id);

            const assertion = await startAuthentication({
                optionsJSON: options,
            });

            await deletePasskey(id, assertion);

            toast.success('Passkey removed successfully.');

            onSuccess(id);
        } catch (err) {
            if (
                err?.name === 'NotAllowedError' ||
                err?.message?.toLowerCase().includes('cancel')
            ) {
                toast.info('Passkey removal was cancelled.');
                return;
            }

            toast.error(
                err?.response?.data?.error ||
                err?.response?.data?.message ||
                err?.message ||
                'Failed to remove passkey.'
            );
        } finally {
            setDeleting(false);
        }
    };

    return (
        <Modal
            isOpen={true}
            onClose={onClose}
            closeDisabled={deleting}
            showCloseButton={false}
            maxWidth="max-w-md"
            className="p-0"
        >
            <div>
                <div className="flex items-center justify-between pb-3 border-b border-marquee-line">
                    <h2 className="font-display text-2xl text-marquee-goldBright">
                        Remove passkey
                    </h2>

                    <button
                        type="button"
                        onClick={() => !deleting && onClose()}
                        disabled={deleting}
                        className="flex h-7 w-7 items-center justify-center rounded-lg text-marquee-muted hover:bg-marquee-panel2 hover:text-marquee-cream transition-colors disabled:opacity-50"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>


                <div className="mt-4 mb-4 text-sm text-marquee-muted">
                    <div className="flex items-center gap-3 rounded-xl border border-marquee-line bg-marquee-panel2 p-4">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-marquee-line/30 text-marquee-gold">
                            <Fingerprint className="h-5 w-5" />
                        </div>

                        <div className="min-w-0">
                            <p className="truncate text-sm font-medium text-marquee-cream">
                                {passkeyName || 'Passkey'}
                            </p>

                            <p className="mt-0.5 text-xs text-marquee-muted">
                                Registered passkey
                            </p>
                        </div>
                    </div>

                    <p className="mt-4 text-sm leading-6 text-marquee-muted">
                        Are you sure you want to remove this passkey? You will
                        no longer be able to use it to sign in to your
                        GoldCinema account
                    </p>

                    <div className="mt-4 rounded-lg border border-amber-500/20 bg-amber-500/5 px-4 py-3">
                        <p className="text-xs leading-5 text-amber-300/90">
                            Make sure you have another way to access your
                            account before removing your last passkey
                        </p>
                    </div>
                </div>

                <div className="mt-7 flex justify-end gap-3">
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={deleting}
                        className="inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-lg border border-marquee-line px-3 py-2 text-xs font-medium text-marquee-muted transition hover:border-marquee-gold/40 hover:text-marquee-gold disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        Cancel
                    </button>

                    <button
                        type="button"
                        onClick={handleDelete}
                        disabled={deleting}
                        className="inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-lg border px-3 py-2 text-xs font-semibold transition-all disabled:cursor-not-allowed disabled:opacity-40 border-red-500/30 bg-marquee-bg/40 text-red-400 hover:border-red-500/50 hover:bg-red-500/10 hover:text-red-400"
                    >
                        {deleting && (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        )}

                        <Trash2 size={16} />
                        {deleting ? 'Removing...' : 'Remove passkey'}
                    </button>
                </div>
            </div>
        </Modal>
    );
}