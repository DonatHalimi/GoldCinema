import { Loader2, Trash2, TriangleAlert } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { deleteAccount } from '../../../api/auth';
import { useAuth } from '../../../context/AuthContext';
import { PasswordField } from '../FormUI';
import Modal from './Modal';

export default function DeleteAccountModal({ onClose }) {
    const { t } = useTranslation('account');

    const [password, setPassword] = useState('');
    const [confirmation, setConfirmation] = useState('');
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();
    const { logout } = useAuth();

    const deleteWord = t('deleteConfirmationWord');

    const canDelete =
        password.trim().length > 0 &&
        confirmation === deleteWord &&
        !loading;

    const handleDelete = async () => {
        if (!password.trim()) {
            toast.error(t('enterPassword'));
            return;
        }

        if (confirmation !== deleteWord) {
            toast.error(t('typeDeleteConfirm2', { word: deleteWord }));
            return;
        }

        try {
            setLoading(true);

            const { data } = await deleteAccount(password);

            toast.success(data.message);
            await logout();

            navigate('/');
        } catch (err) {
            toast.error(err.response?.data?.error || t('deleteAccountError'));
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal
            isOpen={true}
            onClose={onClose}
            title={t('deleteAccountTitle')}
            closeDisabled={loading}
        >
            <div className="mt-5 rounded-lg border border-red-500/20 bg-red-500/5 p-4">
                <div className="flex items-center gap-2">
                    <TriangleAlert className="h-4 w-4 shrink-0 text-red-400" />

                    <p className="text-sm font-semibold text-red-400">
                        {t('deleteAccountWarning')}
                    </p>
                </div>

                <p className="mt-2 text-sm leading-relaxed text-marquee-muted">
                    {t('deleteAccountDesc')}
                </p>
            </div>

            <div className="mt-5">
                <PasswordField
                    label={t('passwordDeleteAccount')}
                    value={password}
                    onChange={setPassword}
                    required
                />
            </div>

            <div className="mt-5">
                <label
                    htmlFor="delete-confirmation"
                    className="mb-2 block text-sm font-medium text-marquee-cream"
                >
                    {t('deleteConfirmationLabel')}{' '}
                    <span className="font-semibold text-red-400">
                        {deleteWord}
                    </span>
                </label>

                <input
                    id="delete-confirmation"
                    type="text"
                    value={confirmation}
                    onChange={(e) => setConfirmation(e.target.value)}
                    placeholder={deleteWord}
                    autoComplete="off"
                    disabled={loading}
                    className={`w-full rounded-lg border bg-marquee-panel2 px-4 py-2.5 text-sm text-marquee-cream outline-none transition-all placeholder:text-marquee-muted/50 ${confirmation.length > 0 &&
                        confirmation !== deleteWord
                        ? 'border-red-500/50 focus:border-red-500'
                        : confirmation === deleteWord
                            ? 'border-green-500/50 focus:border-green-500'
                            : 'border-marquee-line focus:border-marquee-gold'
                        } disabled:cursor-not-allowed disabled:opacity-60`}
                />

                {confirmation.length > 0 &&
                    confirmation !== deleteWord && (
                        <p className="mt-1.5 text-xs text-red-400">
                            {t('typeDeleteExactly2', { word: deleteWord, })}
                        </p>
                    )}

                {confirmation === deleteWord && (
                    <p className="mt-1.5 text-xs text-green-400">
                        {t('confirmationAccepted')}
                    </p>
                )}
            </div>

            <div className="mt-7 flex justify-end gap-3">
                <button
                    type="button"
                    onClick={onClose}
                    disabled={loading}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-marquee-line px-3 py-2 text-xs font-medium text-marquee-muted transition hover:border-marquee-gold/40 hover:text-marquee-gold disabled:opacity-50"
                >
                    {t('cancelDeleteAccount')}
                </button>

                <button
                    type="button"
                    onClick={handleDelete}
                    disabled={!canDelete}
                    className="inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-lg border border-red-500/30 bg-marquee-bg/40 px-3 py-2 text-xs font-semibold text-red-400 transition-all hover:border-red-500/50 hover:bg-red-500/10 hover:text-red-400 disabled:opacity-50"
                >
                    {loading && <Loader2 className="h-4 w-4 animate-spin" />}

                    <Trash2 size={16} />
                    {loading ? t('deleting') : t('deleteAccount')}
                </button>
            </div>
        </Modal>
    );
}