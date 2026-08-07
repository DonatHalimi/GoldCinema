import { useState } from 'react';
import { Loader2, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';
import { PasswordField } from './FormUI';

export default function DeleteAccountModal({ onClose }) {
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();
    const { logout } = useAuth();

    const handleDelete = async () => {
        if (!password.trim()) {
            toast.error('Please enter your password.');
            return;
        }

        try {
            setLoading(true);

            const { data } = await api.delete('/auth/account', {
                data: { password },
            });

            toast.success(data.message);

            await logout();

            navigate('/');
        } catch (err) {
            toast.error(
                err.response?.data?.error || 'Unable to delete account.'
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div onClick={onClose} className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div onClick={(e) => e.stopPropagation()} className="relative w-full max-w-md rounded-xl border border-marquee-line bg-marquee-bg p-6 shadow-2xl">
                <div className="mb-6 flex items-center justify-between">
                    <h2 className="font-display text-2xl font-semibold tracking-wide text-marquee-goldBright">
                        Delete Account
                    </h2>

                    <button
                        onClick={onClose}
                        className="flex h-7 w-7 items-center justify-center rounded-lg text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-zinc-100 disabled:opacity-50"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>

                <PasswordField
                    type="password"
                    label="Password"
                    value={password}
                    onChange={(val) => setPassword(val)}
                    required
                />

                <div className="mt-6 flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="rounded-full border border-marquee-line px-4 py-2 text-sm text-marquee-muted hover:border-marquee-gold"
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

                        {loading ? 'Deleting...' : 'Delete Account'}
                    </button>
                </div>
            </div>
        </div>
    );
}