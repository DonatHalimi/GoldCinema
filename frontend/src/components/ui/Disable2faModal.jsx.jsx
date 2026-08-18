import { Loader2 } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'react-toastify';
import api from '../../api/client';
import { PasswordField } from './FormUI';
import Modal from './Modal';

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

    const methodLabel = isTotp ? 'Authenticator App' : isEmail ? 'Email Authentication' : 'Two-Factor Authentication';

    const handleDisable = async (event) => {
        event.preventDefault();

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
            setError(err.response?.data?.error || err.response?.data?.message || 'Failed to disable 2FA. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal
            isOpen
            onClose={onClose}
            title="Disable 2FA"
            closeDisabled={loading}
        >
            <div className="mt-4">
                <p className="text-sm text-marquee-muted">
                    You are about to disable{' '}
                    <span className="font-medium text-marquee-cream">
                        {methodLabel}
                    </span>{' '}
                    authentication.
                </p>

                <p className="mt-2 text-sm text-marquee-muted">
                    Enter your current password to confirm this
                    change.
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

                <div className="flex items-center justify-end gap-3 pt-2">
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={loading}
                        className="rounded-full border border-marquee-line px-4 py-2 text-sm text-marquee-muted transition hover:border-marquee-gold hover:text-marquee-cream disabled:cursor-not-allowed disabled:opacity-50"
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
        </Modal>
    );
}