import { Loader2, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import api from '../../api/client';
import { PasswordField } from './FormUI';

export default function Disable2faModal({
    method,
    onClose,
    onSuccess,
}) {
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const isTotp = method === 'totp';
    const isEmail = method === 'email';

    const methodLabel = isTotp
        ? 'Authenticator App'
        : isEmail
            ? 'Email Authentication'
            : 'Two-Factor Authentication';

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
            await api.post('/auth/2fa/disable-method', {
                password,
                method,
            });

            onSuccess(method);
        } catch (err) {
            toast.error('Failed to disable 2FA');
            console.log(error);
            setError(
                err.response?.data?.error ||
                err.response?.data?.message ||
                'Failed to disable 2FA. Please try again.'
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
                            Disable 2FA
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
                        You are about to disable{' '}
                        <span className="font-medium text-marquee-cream">
                            {methodLabel}
                        </span>{' '}
                        authentication.
                    </p>

                    <p className="mt-2 text-sm text-marquee-muted">
                        Enter your current password to confirm this change.
                    </p>
                </div>

                <form onSubmit={handleDisable} className="mt-5 space-y-4">
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
                            className="rounded-full border border-marquee-line px-4 py-2 text-sm text-marquee-muted hover:border-marquee-gold"
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            disabled={loading || !password.trim()}
                            className="inline-flex items-center gap-2 rounded-full bg-red-600 px-5 py-2 text-sm font-semibold text-white transition hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            {loading && <Loader2 className="h-4 w-4 animate-spin" />}

                            {loading ? 'Disabling...' : 'Disable 2FA'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}