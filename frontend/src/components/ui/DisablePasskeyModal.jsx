import { useEffect, useState } from 'react';
import api from '../../api/client';
import { PasswordField } from './FormUI';
import { Loader2, X } from 'lucide-react';
import { toast } from 'react-toastify';

export default function DisablePasskeyModal({
    id,
    passkeyName,
    onClose,
    onSuccess,
}) {
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape') {
                onClose();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [onClose]);

    const handleDisable = async (e) => {
        e.preventDefault();

        if (!password.trim()) {
            setError('Please enter your current password.');
            return;
        }

        setLoading(true);
        setError('');

        try {
            await api.delete(`/auth/passkeys/${id}`, {
                data: { password },
            });

            toast.success('Passkey removed successfully.');
            onSuccess(id);
        } catch (err) {
            toast.error('Failed to remove passkey');
            setError(
                err.response?.data?.error ||
                err.response?.data?.message ||
                'Failed to remove passkey. Please try again.'
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div onClick={onClose} className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
            <div onClick={(e) => e.stopPropagation()} className="relative w-full max-w-md rounded-xl border border-marquee-line bg-marquee-bg p-6 shadow-2xl">
                <div className="flex items-center justify-between border-b border-marquee-line/50 pb-3">
                    <div className="flex items-center gap-3">
                        <h2 className="font-display text-2xl font-semibold tracking-wide text-marquee-goldBright">
                            Remove Passkey
                        </h2>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        className="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-zinc-100"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <div className="mt-4">
                    <p className="text-sm text-marquee-muted">
                        You are about to remove the passkey{' '}
                        <span className="font-medium text-marquee-cream">
                            {passkeyName || 'Passkey'}
                        </span>.
                    </p>

                    <p className="mt-2 text-sm text-marquee-muted">
                        Enter your current password to confirm this change.
                    </p>
                </div>

                <form
                    onSubmit={handleDisable}
                    className="mt-5 space-y-4"
                >
                    <PasswordField
                        label="Current Password"
                        value={password}
                        onChange={setPassword}
                        required
                        error={error}
                    />

                    {error && (
                        <p className="text-sm text-red-400">
                            {error}
                        </p>
                    )}

                    <div className="flex items-center justify-end gap-3 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={loading}
                            className="rounded-full px-4 py-2 text-sm font-medium text-marquee-muted transition hover:text-marquee-cream disabled:opacity-50"
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            disabled={loading || !password.trim()}
                            className="inline-flex items-center gap-2 rounded-full bg-red-600 px-5 py-2 text-sm font-semibold text-white transition hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            {loading && (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            )}

                            {loading
                                ? 'Removing...'
                                : 'Remove Passkey'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}