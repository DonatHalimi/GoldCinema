import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';

/**
 * Generic confirm/destructive-action modal, styled to match the existing
 * delete-confirmation markup in ModuleDataGrid.jsx. Intentionally has no
 * feature-specific logic so it can be reused anywhere a "are you sure?"
 * step is needed (Sessions, Favourites, Payment Methods, etc.).
 */
export default function ConfirmDialog({
    isOpen,
    title,
    description,
    confirmLabel = 'Confirm',
    cancelLabel = 'Cancel',
    isDestructive = true,
    isSubmitting = false,
    onConfirm,
    onClose,
}) {
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
                            <h2 className="font-display text-2xl text-marquee-goldBright">{title}</h2>
                            <button
                                onClick={() => !isSubmitting && onClose()}
                                disabled={isSubmitting}
                                className="flex h-7 w-7 items-center justify-center rounded-lg text-marquee-muted hover:bg-marquee-panel2 hover:text-marquee-cream transition-colors disabled:opacity-50"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </div>

                        <p className="mt-4 text-sm text-marquee-muted">{description}</p>

                        <div className="mt-8 flex justify-end gap-3">
                            <button
                                onClick={onClose}
                                disabled={isSubmitting}
                                className="rounded-lg border border-marquee-line px-4 py-2 text-sm text-marquee-cream hover:bg-marquee-panel2 transition-colors disabled:opacity-50"
                            >
                                {cancelLabel}
                            </button>

                            <button
                                onClick={onConfirm}
                                disabled={isSubmitting}
                                className={
                                    isDestructive
                                        ? 'rounded-lg bg-marquee-marquee px-4 py-2 text-sm font-semibold text-white hover:bg-marquee-marquee/90 disabled:opacity-50 transition-colors'
                                        : 'rounded-lg bg-marquee-gold px-4 py-2 text-sm font-semibold text-marquee-bg hover:bg-marquee-goldBright disabled:opacity-50 transition-colors'
                                }
                            >
                                {isSubmitting ? 'Please wait...' : confirmLabel}
                            </button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}