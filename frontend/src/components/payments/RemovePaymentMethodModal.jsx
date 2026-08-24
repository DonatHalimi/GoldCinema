import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function RemovePaymentMethodModal({
    isOpen,
    title,
    description,
    confirmLabel = 'Confirm',
    cancelLabel = 'Cancel',
    isDestructive = true,
    isSubmitting = false,
    onConfirm,
    onClose,
    confirmationText = '',
}) {
    const [confirmation, setConfirmation] = useState('');

    useEffect(() => {
        if (!isOpen) {
            setConfirmation('');
        }
    }, [isOpen]);

    const requiresConfirmation = Boolean(confirmationText);

    const canConfirm =
        !isSubmitting &&
        (!requiresConfirmation ||
            confirmation === confirmationText);

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={() => !isSubmitting && onClose()}
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm px-4"
                >
                    <motion.div
                        initial={{ opacity: 0, scale: 0.96, y: 8 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.96, y: 8 }}
                        transition={{ duration: 0.15 }}
                        onClick={(e) => e.stopPropagation()}
                        className="relative w-full max-w-md rounded-xl border border-marquee-line bg-marquee-panel p-6 shadow-2xl"
                    >
                        <div className="flex items-center justify-between pb-3 border-b border-marquee-line">
                            <h2 className="font-display text-2xl text-marquee-goldBright">
                                {title}
                            </h2>

                            <button
                                type="button"
                                onClick={() => !isSubmitting && onClose()}
                                disabled={isSubmitting}
                                className="flex h-7 w-7 items-center justify-center rounded-lg text-marquee-muted hover:bg-marquee-panel2 hover:text-marquee-cream transition-colors disabled:opacity-50"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </div>

                        <p className="mt-4 text-sm text-marquee-muted">
                            {description}
                        </p>

                        {requiresConfirmation && (
                            <div className="mt-5">
                                <label htmlFor="delete-confirmation" className="mb-2 block text-sm font-medium text-marquee-cream">
                                    Type{' '}
                                    <span className="font-semibold text-red-400">
                                        {confirmationText}
                                    </span>{' '}
                                    to confirm
                                </label>


                                <input
                                    id="confirm-dialog-input"
                                    type="text"
                                    value={confirmation}
                                    onChange={(e) =>
                                        setConfirmation(e.target.value)
                                    }
                                    disabled={isSubmitting}
                                    autoComplete="off"
                                    placeholder={confirmationText}
                                    className="w-full rounded-lg border border-marquee-line bg-marquee-panel2 px-4 py-2.5 text-sm text-marquee-cream outline-none transition-colors placeholder:text-marquee-muted focus:border-marquee-gold disabled:cursor-not-allowed disabled:opacity-50"
                                />

                                {confirmation.length > 0 &&
                                    confirmation !== 'REMOVE' && (
                                        <p className="mt-1.5 text-xs text-red-400">
                                            Please type REMOVE exactly as shown.
                                        </p>
                                    )}

                                {confirmation === 'REMOVE' && (
                                    <p className="mt-1.5 text-xs text-green-400">
                                        Confirmation accepted.
                                    </p>
                                )}
                            </div>
                        )}

                        <div className="mt-8 flex justify-end gap-3">
                            <button
                                type="button"
                                onClick={onClose}
                                disabled={isSubmitting}
                                className="rounded-lg border border-marquee-line px-4 py-2 text-sm text-marquee-cream hover:bg-marquee-panel2 transition-colors disabled:opacity-50"
                            >
                                {cancelLabel}
                            </button>

                            <button
                                type="button"
                                onClick={onConfirm}
                                disabled={!canConfirm}
                                className={
                                    isDestructive
                                        ? 'rounded-lg bg-marquee-marquee px-4 py-2 text-sm font-semibold text-white hover:bg-marquee-marquee/90 disabled:opacity-50 transition-colors'
                                        : 'rounded-lg bg-marquee-gold px-4 py-2 text-sm font-semibold text-marquee-bg hover:bg-marquee-goldBright disabled:opacity-50 transition-colors'
                                }
                            >
                                {isSubmitting
                                    ? 'Please wait...'
                                    : confirmLabel}
                            </button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}