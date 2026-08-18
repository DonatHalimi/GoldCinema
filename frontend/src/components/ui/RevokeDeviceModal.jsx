import { Loader2, TriangleAlert } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'react-toastify';

import api from '../../api/client';
import { PasswordField } from './FormUI';
import Modal from './Modal';

export default function RevokeDeviceModal({ device, onClose, onSuccess }) {
    const [password, setPassword] = useState('');
    const [confirmation, setConfirmation] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const canRevoke = password.trim().length > 0 && confirmation === 'REVOKE' && !loading;

    const clearError = () => {
        if (error) setError('');
    };

    const handleRevoke = async (event) => {
        event.preventDefault();

        if (!password.trim()) {
            setError('Please enter your current password.');
            return;
        }

        if (confirmation !== 'REVOKE') {
            setError('Please type REVOKE to confirm.');
            return;
        }

        setLoading(true);
        setError('');

        try {
            await api.delete(`/auth/devices/${device._id}`, {
                data: {
                    password,
                    confirmation,
                },
            });

            toast.success('Device revoked successfully.');

            onSuccess(device._id);
        } catch (err) {
            setError(err.response?.data?.error || err.response?.data?.message || 'Failed to remove device. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const deviceName = device.label || device.name || 'Unknown Device';

    return (
        <Modal
            isOpen={Boolean(device)}
            onClose={onClose}
            title="Revoke Trusted Device"
            closeDisabled={loading}
        >
            <div className="mt-5 rounded-lg border border-red-500/20 bg-red-500/5 p-4">
                <div className="flex items-center gap-2">
                    <TriangleAlert className="h-4 w-4 shrink-0 text-red-400" />

                    <p className="text-sm font-semibold text-red-400">
                        You are about to revoke trust for{' '}
                        <span className="font-medium text-marquee-cream">
                            {deviceName}
                        </span>
                        .
                    </p>
                </div>

                <p className="mt-2 text-sm text-marquee-muted">
                    This device will no longer be trusted and will
                    require normal authentication the next time it
                    signs in.
                </p>
            </div>

            <form onSubmit={handleRevoke} className="mt-5 space-y-5">
                <PasswordField
                    label="Current Password"
                    value={password}
                    onChange={(value) => {
                        setPassword(value);
                        clearError();
                    }}
                    required
                    error={error}
                />

                <div>
                    <label htmlFor="revoke-confirmation" className="mb-2 block text-sm font-medium text-marquee-cream">
                        Type{' '}
                        <span className="font-semibold text-red-400">REVOKE</span>{' '}to confirm
                    </label>

                    <input
                        id="revoke-confirmation"
                        type="text"
                        value={confirmation}
                        onChange={(event) => {
                            setConfirmation(event.target.value);
                            clearError();
                        }}
                        placeholder="REVOKE"
                        autoComplete="off"
                        disabled={loading}
                        className={`w-full rounded-lg border bg-marquee-panel2 px-4 py-2.5 text-sm text-marquee-cream outline-none transition-all placeholder:text-marquee-muted/50 ${confirmation.length > 0 &&
                            confirmation !== 'REVOKE'
                            ? 'border-red-500/50 focus:border-red-500'
                            : confirmation === 'REVOKE'
                                ? 'border-green-500/50 focus:border-green-500'
                                : 'border-marquee-line focus:border-marquee-gold'
                            } disabled:cursor-not-allowed disabled:opacity-60`}
                    />

                    {confirmation.length > 0 &&
                        confirmation !== 'REVOKE' && (
                            <p className="mt-1.5 text-xs text-red-400">
                                Please type REVOKE exactly as shown.
                            </p>
                        )}

                    {confirmation === 'REVOKE' && (
                        <p className="mt-1.5 text-xs text-green-400">
                            Confirmation accepted.
                        </p>
                    )}
                </div>

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
                        disabled={!canRevoke}
                        className="inline-flex items-center gap-2 rounded-full bg-red-600 px-5 py-2 text-sm font-semibold text-white transition hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        {loading && <Loader2 className="h-4 w-4 animate-spin" />}

                        {loading ? 'Revoking...' : 'Revoke Device'}
                    </button>
                </div>
            </form>
        </Modal>
    );
}