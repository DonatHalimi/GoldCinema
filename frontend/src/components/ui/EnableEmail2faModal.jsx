import { useState, useEffect } from 'react';
import api from '../../api/client';
import { PasswordField } from './FormUI';

export default function Disable2faModal({ onClose, onSuccess }) {
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="relative w-full max-w-md rounded-xl border border-marquee-line bg-marquee-bg p-6 shadow-2xl">
                <button
                    type="button"
                    onClick={onClose}
                    className="absolute right-4 top-4 text-marquee-muted hover:text-marquee-cream"
                >
                    ✕
                </button>

                <h2 className="text-xl font-semibold text-marquee-cream">
                    Disable Two-Factor Authentication
                </h2>

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
                            className="rounded-full bg-red-600 px-5 py-2 text-sm font-semibold text-white transition hover:bg-red-500 disabled:opacity-50"
                        >
                            {loading ? 'Disabling...' : 'Disable 2FA'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}