import { AnimatePresence, motion } from 'framer-motion';
import { Check, CheckCircle2, Loader2, Trash2, TriangleAlert } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Modal from '../ui/modals/Modal';

export default function RemovePaymentMethodModal({
    isOpen,
    title,
    description,
    isDestructive = true,
    isSubmitting = false,
    onConfirm,
    onClose,
    confirmationText = '',
}) {
    const { t } = useTranslation('account');
    const [confirmation, setConfirmation] = useState('');

    useEffect(() => {
        if (!isOpen) {
            setConfirmation('');
        }
    }, [isOpen]);

    const requiresConfirmation = Boolean(confirmationText);

    const canConfirm =
        !isSubmitting &&
        (!requiresConfirmation || confirmation === confirmationText);

    const isConfirmed =
        requiresConfirmation && confirmation === confirmationText;

    const hasInvalidConfirmation =
        requiresConfirmation &&
        confirmation.length > 0 &&
        confirmation !== confirmationText;

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={title}
            closeDisabled={isSubmitting}
        >
            <div className="space-y-6">
                <div className="flex gap-4 rounded-xl border border-marquee-line bg-marquee-panel2/60 p-4">
                    <div
                        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${isDestructive
                            ? 'bg-red-500/10 text-red-400'
                            : 'bg-marquee-gold/10 text-marquee-gold'
                            }`}
                    >
                        <TriangleAlert className="h-5 w-5" />
                    </div>

                    <div className="min-w-0">
                        <p className="text-sm leading-6 text-marquee-muted">
                            {description}
                        </p>
                    </div>
                </div>

                <AnimatePresence initial={false}>
                    {requiresConfirmation && (
                        <motion.div
                            initial={{ opacity: 0, height: 0, y: -8 }}
                            animate={{ opacity: 1, height: 'auto', y: 0 }}
                            exit={{ opacity: 0, height: 0, y: -8 }}
                            transition={{ duration: 0.2 }}
                            className="overflow-hidden"
                        >
                            <div className="space-y-2">
                                <label
                                    htmlFor="confirm-dialog-input"
                                    className="block text-sm font-medium text-marquee-cream"
                                >
                                    {t('typePaymentMethodModal')}{' '}
                                    <span
                                        className={
                                            isDestructive
                                                ? 'font-semibold text-red-400'
                                                : 'font-semibold text-marquee-gold'
                                        }
                                    >
                                        {confirmationText}
                                    </span>{' '}
                                    {t('typePaymentMethodModal2')}
                                </label>

                                <div className="relative">
                                    <input
                                        id="confirm-dialog-input"
                                        type="text"
                                        value={confirmation}
                                        onChange={(e) =>
                                            setConfirmation(e.target.value)
                                        }
                                        disabled={isSubmitting}
                                        autoComplete="off"
                                        autoFocus
                                        placeholder={confirmationText}
                                        className={`w-full rounded-xl border bg-marquee-panel2 px-4 py-3 pr-11 text-sm text-marquee-cream outline-none transition-all placeholder:text-marquee-muted disabled:cursor-not-allowed disabled:opacity-50 ${isConfirmed
                                            ? 'border-green-500/50 focus:border-green-500'
                                            : hasInvalidConfirmation
                                                ? 'border-red-500/50 focus:border-red-500'
                                                : 'border-marquee-line focus:border-marquee-gold'
                                            }`}
                                    />

                                    <AnimatePresence mode="wait">
                                        {isConfirmed && (
                                            <motion.div
                                                key="success"
                                                initial={{
                                                    opacity: 0,
                                                    scale: 0.7,
                                                }}
                                                animate={{
                                                    opacity: 1,
                                                    scale: 1,
                                                }}
                                                exit={{
                                                    opacity: 0,
                                                    scale: 0.7,
                                                }}
                                                className="absolute right-3 top-1/2 -translate-y-1/2 text-green-400"
                                            >
                                                <CheckCircle2 className="h-5 w-5" />
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>

                                <AnimatePresence initial={false} mode="wait">
                                    {hasInvalidConfirmation && (
                                        <motion.p
                                            key="invalid"
                                            initial={{
                                                opacity: 0,
                                                y: -4,
                                            }}
                                            animate={{
                                                opacity: 1,
                                                y: 0,
                                            }}
                                            exit={{
                                                opacity: 0,
                                                y: -4,
                                            }}
                                            className="text-xs text-red-400"
                                        >
                                            {t('removePaymentMethodModal')} {confirmationText}{' '} {t('removePaymentMethodModal2')}
                                        </motion.p>
                                    )}

                                    {isConfirmed && (
                                        <motion.p
                                            key="confirmed"
                                            initial={{
                                                opacity: 0,
                                                y: -4,
                                            }}
                                            animate={{
                                                opacity: 1,
                                                y: 0,
                                            }}
                                            exit={{
                                                opacity: 0,
                                                y: -4,
                                            }}
                                            className="text-xs text-green-400"
                                        >
                                            {t('confirmationAccepted')}
                                        </motion.p>
                                    )}
                                </AnimatePresence>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                <div className="flex items-center justify-end gap-3 border-t border-marquee-line pt-5">
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={isSubmitting}
                        className="inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-lg border border-marquee-line px-3 py-2 text-xs font-medium text-marquee-muted transition hover:border-marquee-gold/40 hover:text-marquee-gold disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        {t('cancelPaymentModal')}
                    </button>

                    <button
                        type="button"
                        onClick={onConfirm}
                        disabled={!canConfirm}
                        className={`inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-lg border px-3 py-2 text-xs font-semibold transition-all disabled:cursor-not-allowed disabled:opacity-40 ${isDestructive
                            ? 'border-red-500/30 bg-marquee-bg/40 text-red-400 hover:border-red-500/50 hover:bg-red-500/10 hover:text-red-400'
                            : 'border-marquee-gold/30 bg-marquee-panel2 text-marquee-gold hover:border-marquee-gold/50 hover:bg-marquee-gold/10 hover:text-marquee-gold'
                            }`}
                    >
                        {isSubmitting ? (
                            <>
                                <Loader2 className="h-4 w-4 animate-spin" />
                                Please wait...
                            </>
                        ) : (
                            <>
                                {isDestructive ? <Trash2 size={16} /> : <Check size={16} />}
                                {t('confirmPaymentModal')}
                            </>
                        )}
                    </button>
                </div>
            </div>
        </Modal>
    );
}