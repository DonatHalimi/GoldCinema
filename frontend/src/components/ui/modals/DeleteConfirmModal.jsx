import { Loader2, Trash2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import Modal from './Modal';

export default function DeleteConfirmModal({
    deleteTarget,
    label,
    deleting,
    onClose,
    onConfirm,
}) {
    const { t } = useTranslation('dashboard');
    if (!deleteTarget) return null;

    const isBulkDelete = Array.isArray(deleteTarget);

    const title = isBulkDelete
        ? t('deleteConfirmBulkTitle', { count: deleteTarget.length })
        : t('deleteConfirmTitle', { label: label?.slice(0, -1) });

    const message = isBulkDelete
        ? t('deleteConfirmBulkMessage', { count: deleteTarget.length })
        : t('deleteConfirmMessage');

    return (
        <Modal
            isOpen
            onClose={onClose}
            title={title}
            closeDisabled={deleting}
        >
            <p className="mt-4 text-sm text-zinc-400">
                {message}
            </p>

            <div className="mt-8 flex justify-end gap-3">
                <button
                    type="button"
                    onClick={onClose}
                    disabled={deleting}
                    className="inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-lg border border-marquee-line px-3 py-2 text-xs font-medium text-marquee-muted transition hover:border-marquee-gold/40 hover:text-marquee-gold disabled:cursor-not-allowed disabled:opacity-50"
                >
                    {t('rbacCancel')}
                </button>

                <button
                    type="button"
                    onClick={onConfirm}
                    disabled={deleting}
                    className="inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-lg border px-3 py-2 text-xs font-semibold transition-all disabled:cursor-not-allowed disabled:opacity-40 border-red-500/30 bg-marquee-bg/40 text-red-400 hover:border-red-500/50 hover:bg-red-500/10 hover:text-red-400"
                >
                    {deleting && <Loader2 className="h-4 w-4 animate-spin" />}

                    <Trash2 size={16} />
                    {deleting ? t('deleting') : t('deleteAction')}
                </button>
            </div>
        </Modal>
    );
}