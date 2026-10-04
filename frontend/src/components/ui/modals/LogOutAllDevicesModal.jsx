import { LogOut } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import Modal from './Modal';

export default function LogoutAllDevicesModal({
    isOpen,
    count,
    loading,
    onCancel,
    onConfirm,
}) {
    const { t } = useTranslation('account');

    if (!isOpen) return null;

    return (
        <Modal
            isOpen
            onClose={onCancel}
            title={t('logoutAllDevicesTitle')}
            closeDisabled={loading}
        >
            <div className="mt-5">
                <p className="text-sm text-marquee-muted">
                    {count === null
                        ? t('logoutAllDevicesDesc')
                        : t('logoutAllDevicesCountDesc', {
                            count,
                        })}
                </p>
            </div>

            <div className="mt-6 flex justify-end gap-3">
                <button
                    type="button"
                    onClick={onCancel}
                    disabled={loading}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-marquee-line px-3 py-2 text-xs font-medium text-marquee-muted transition hover:border-marquee-gold/40 hover:text-marquee-gold disabled:opacity-50"
                >
                    {t('cancelLogOutAll')}
                </button>

                <button
                    type="button"
                    onClick={onConfirm}
                    disabled={loading}
                    className="inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-lg border border-red-500/30 bg-marquee-bg/40 px-3 py-2 text-xs font-semibold text-red-400 transition-all hover:border-red-500/50 hover:bg-red-500/10 hover:text-red-400 disabled:opacity-50"
                >
                    <LogOut size={16} />
                    {loading ? t('loggingOut') : t('logoutEverywhere')}
                </button>
            </div>
        </Modal>
    );
}