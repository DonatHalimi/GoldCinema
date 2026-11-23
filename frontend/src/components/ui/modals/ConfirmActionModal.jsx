import { AlertTriangle, LoaderCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import Modal from './Modal';

export default function ConfirmActionModal({
    isOpen,
    title,
    message,
    confirmLabel,
    cancelLabel,
    onClose,
    onConfirm,
    isLoading = false,
    icon: Icon = AlertTriangle,
    variant = 'danger',
}) {
    const { t } = useTranslation('dashboard');
    const isDanger = variant === 'danger';

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            closeDisabled={isLoading}
            title={title}
            width="max-w-md"
        >
            <div className="mt-5 flex items-start gap-4">
                <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border ${isDanger ? 'border-red-500/30 bg-red-500/10 text-red-400' : 'border-marquee-gold/30 bg-marquee-gold/10 text-marquee-gold'}`}>
                    <Icon size={20} />
                </div>
                <p className="pt-1 text-sm leading-6 text-marquee-muted">{message}</p>
            </div>
            <div className="mt-8 flex justify-end gap-3">
                <button
                    type="button"
                    onClick={onClose}
                    disabled={isLoading}
                    className="rounded-lg border border-marquee-line px-4 py-2 text-sm text-marquee-muted transition hover:border-marquee-gold/40 hover:text-marquee-cream disabled:opacity-50"
                >
                    {cancelLabel || t('emailTemplateCancel')}
                </button>
                <button
                    type="button"
                    onClick={onConfirm}
                    disabled={isLoading}
                    className={`inline-flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 ${isDanger ? 'border-red-500/30 bg-red-500/10 text-red-300 hover:bg-red-500/20' : 'border-marquee-gold/40 bg-marquee-gold text-marquee-bg hover:bg-marquee-goldBright'}`}
                >
                    {isLoading && <LoaderCircle size={16} className="animate-spin" />}
                    {confirmLabel}
                </button>
            </div>
        </Modal>
    );
}
