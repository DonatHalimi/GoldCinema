import { Loader2, TriangleAlert } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../../../context/AuthContext';
import Modal from './Modal';
import { PasswordField } from '../FormUI';
import { deleteAccount } from '../../../api/auth';

export default function DeleteAccountModal({ onClose }) {
    const [password, setPassword] = useState('');
    const [confirmation, setConfirmation] = useState('');
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();
    const { logout } = useAuth();

    const canDelete = password.trim().length > 0 &&
        confirmation === 'DELETE' &&
        !loading;

    const handleDelete = async () => {
        if (!password.trim()) {
            toast.error('Please enter your password.');
            return;
        }

        if (confirmation !== 'DELETE') {
            toast.error('Please type DELETE to confirm.');
            return;
        }

        try {
            setLoading(true);

            const { data } = await deleteAccount(password);

            toast.success(data.message);

            await logout();

            navigate('/');
        } catch (err) {
            toast.error(err.response?.data?.error || 'Unable to delete account.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal
            isOpen={true}
            onClose={onClose}
            title="Delete Account"
            closeDisabled={loading}
        >
            <div className="mt-5 rounded-lg border border-red-500/20 bg-red-500/5 p-4">
                <div className="flex items-center gap-2">
                    <TriangleAlert className="h-4 w-4 shrink-0 text-red-400" />

                    <p className="text-sm font-semibold text-red-400">
                        This action cannot be undone.
                    </p>
                </div>

                <p className="mt-2 text-sm leading-relaxed text-marquee-muted">
                    Your account and associated personal data will be
                    permanently deleted. You will also be signed out of
                    all active sessions.
                </p>
            </div>

            <div className="mt-5">
                <PasswordField
                    label="Password"
                    value={password}
                    onChange={setPassword}
                    required
                />
            </div>

            <div className="mt-5">
                <label htmlFor="delete-confirmation" className="mb-2 block text-sm font-medium text-marquee-cream">
                    Type{' '}
                    <span className="font-semibold text-red-400">
                        DELETE
                    </span>{' '}
                    to confirm
                </label>

                <input
                    id="delete-confirmation"
                    type="text"
                    value={confirmation}
                    onChange={(e) => setConfirmation(e.target.value)}
                    placeholder="DELETE"
                    autoComplete="off"
                    disabled={loading}
                    className={`w-full rounded-lg border bg-marquee-panel2 px-4 py-2.5 text-sm text-marquee-cream outline-none transition-all placeholder:text-marquee-muted/50 ${confirmation.length > 0 &&
                        confirmation !== 'DELETE'
                        ? 'border-red-500/50 focus:border-red-500'
                        : confirmation === 'DELETE'
                            ? 'border-green-500/50 focus:border-green-500'
                            : 'border-marquee-line focus:border-marquee-gold'
                        } disabled:cursor-not-allowed disabled:opacity-60`}
                />

                {confirmation.length > 0 &&
                    confirmation !== 'DELETE' && (
                        <p className="mt-1.5 text-xs text-red-400">
                            Please type DELETE exactly as shown.
                        </p>
                    )}

                {confirmation === 'DELETE' && (
                    <p className="mt-1.5 text-xs text-green-400">
                        Confirmation accepted.
                    </p>
                )}
            </div>

            <div className="mt-7 flex justify-end gap-3">
                <button
                    type="button"
                    onClick={onClose}
                    disabled={loading}
                    className="rounded-full border border-marquee-line px-4 py-2 text-sm text-marquee-muted transition-colors hover:border-marquee-gold hover:text-marquee-cream disabled:cursor-not-allowed disabled:opacity-50"
                >
                    Cancel
                </button>

                <button
                    type="button"
                    onClick={handleDelete}
                    disabled={!canDelete}
                    className="inline-flex items-center gap-2 rounded-full bg-red-600 px-5 py-2 text-sm font-semibold text-white transition-all hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-40"
                >
                    {loading && <Loader2 className="h-4 w-4 animate-spin" />}

                    {loading ? 'Deleting...' : 'Delete Account'}
                </button>
            </div>
        </Modal>
    );
}