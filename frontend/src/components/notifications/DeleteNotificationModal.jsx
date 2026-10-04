import { Archive, Loader2, TriangleAlert } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import Modal from '../ui/modals/Modal';

export default function DeleteNotificationModal({
    isOpen,
    onConfirm,
    onCancel,
    title,
    deleting = false,
}) {
    const { t } = useTranslation('account');

    const isBulkDelete = title === t('allArchivedNotifs');

    return (
        <Modal
            isOpen={isOpen}
            onClose={onCancel}
            closeDisabled={deleting}
            title={
                isBulkDelete
                    ? t('deleteArchivedNotifTitle')
                    : t('deleteNotifTitle')
            }
        >
            <div className="mt-5 rounded-lg border border-red-500/20 bg-red-500/5 p-4">
                <div className="flex items-center gap-2">
                    <TriangleAlert className="h-4 w-4 shrink-0 text-red-400" />
                    <p className="text-sm font-semibold text-red-400">
                        {t('deleteNotifWarning')}
                    </p>
                </div>

                <p className="mt-2 text-sm leading-relaxed text-marquee-muted">
                    {isBulkDelete
                        ? t('confirmDeleteArchivedNotif')
                        : t('confirmDeleteNotif')}
                </p>
            </div>

            {title && (
                <div className="mt-5 rounded-lg border border-marquee-line bg-marquee-panel2 p-4">
                    <div className="flex items-center gap-2">
                        <Archive className="h-4 w-4 shrink-0 text-marquee-gold" />
                        <p className="text-xs font-medium uppercase tracking-wide text-marquee-muted">
                            {isBulkDelete
                                ? t('archivedNotifs')
                                : t('notification')}
                        </p>
                    </div>

                    <p className="mt-2 truncate text-sm font-semibold text-marquee-cream">
                        {isBulkDelete
                            ? t('allArchivedNotifs')
                            : title}
                    </p>
                </div>
            )}

            <div className="mt-7 flex justify-end gap-3">
                <button
                    type="button"
                    onClick={onCancel}
                    disabled={deleting}
                    className="rounded-full border border-marquee-line px-4 py-2 text-sm text-marquee-muted transition-colors hover:border-marquee-gold hover:text-marquee-cream disabled:cursor-not-allowed disabled:opacity-50"
                >
                    {t('cancelDeleteNotif')}
                </button>

                <button
                    type="button"
                    onClick={onConfirm}
                    disabled={deleting}
                    className="inline-flex items-center gap-2 rounded-full bg-red-600 px-5 py-2 text-sm font-semibold text-white transition-all hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-40"
                >
                    {deleting && (
                        <Loader2 className="h-4 w-4 animate-spin" />
                    )}

                    {deleting
                        ? t('deletingNotif')
                        : t('deleteNotif')}
                </button>
            </div>
        </Modal>
    );
}