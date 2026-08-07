import { useState } from 'react';
import api from '../../api/client';
import { PasswordField } from './FormUI';
import { Loader2, X } from 'lucide-react';

export default function Disable2faModal({ onClose, onSuccess }) {
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleDisable = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            await api.post('/auth/2fa/disable', {
                ...(password && { password }),
            });

            onSuccess();
        } catch (err) {
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
        <div onClick={onClose} className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div onClick={(e) => e.stopPropagation()} className="relative w-full max-w-md rounded-xl border border-marquee-line bg-marquee-bg p-6 shadow-2xl">
                <div className="flex items-center justify-between pb-3 border-b border-marquee-line/50">
                    <h2 className="font-display text-2xl font-semibold tracking-wide text-marquee-goldBright">
                        Disable Two-Factor Authentication
                    </h2>
                    <button
                        type="button"
                        onClick={onClose}
                        className="flex h-7 w-7 items-center justify-center rounded-lg text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100 transition-colors"
                    >
                        <X />
                    </button>
                </div>
                <p className="mt-2 text-sm text-marquee-muted">
                    Are you sure you want to disable Two-Factor Authentication?
                </p>

                <form onSubmit={handleDisable} className="mt-5 space-y-4">
                    <PasswordField
                        label="Current Password"
                        value={password}
                        onChange={(val) => setPassword(val)}
                        required
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
                            className="rounded-full px-4 py-2 text-sm font-medium text-marquee-muted hover:text-marquee-cream"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="inline-flex items-center gap-2 rounded-full bg-red-600 px-5 py-2 text-sm font-semibold text-white transition hover:bg-red-500 disabled:opacity-50"
                        >
                            {loading && (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            )}

                            {loading ? 'Disabling...' : 'Disable 2FA'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}