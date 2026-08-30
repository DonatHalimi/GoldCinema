import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';
import { useEffect } from 'react';
import useEscapeKey from '../../../hooks/useEscKey';

export default function Modal({
    isOpen,
    onClose,
    children,
    title,
    maxWidth = 'max-w-md',
    closeDisabled = false,
    showCloseButton = true,
    className = '',
}) {
    useEscapeKey(
        () => {
            if (!closeDisabled) {
                onClose();
            }
        },
        isOpen && !closeDisabled
    );

    useEffect(() => {
        if (!isOpen) return;

        const originalOverflow = document.body.style.overflow;

        document.body.style.overflow = 'hidden';

        return () => {
            document.body.style.overflow = originalOverflow;
        };
    }, [isOpen]);

    if (!isOpen) {
        return null;
    }

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
                onClick={() => {
                    if (!closeDisabled) {
                        onClose();
                    }
                }}
                className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
            >
                <motion.div
                    initial={{
                        opacity: 0,
                        scale: 0.95,
                        y: 10,
                    }}
                    animate={{
                        opacity: 1,
                        scale: 1,
                        y: 0,
                    }}
                    exit={{
                        opacity: 0,
                        scale: 0.95,
                        y: 10,
                    }}
                    transition={{
                        type: 'spring',
                        stiffness: 400,
                        damping: 30,
                    }}
                    onClick={(event) => event.stopPropagation()}
                    className={`relative w-full ${maxWidth} rounded-xl border border-marquee-line bg-marquee-bg p-6 shadow-2xl ${className}`}
                >
                    {(title || showCloseButton) && (
                        <div className="flex items-center justify-between border-b border-marquee-line/50 pb-3">
                            {title &&
                                <h2 className="font-display text-2xl font-semibold tracking-wide text-marquee-goldBright">
                                    {title}
                                </h2>
                            }

                            {showCloseButton && (
                                <button
                                    type="button"
                                    onClick={onClose}
                                    disabled={closeDisabled}
                                    className="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-zinc-100 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    <X className="h-5 w-5" />
                                </button>
                            )}
                        </div>
                    )}

                    {children}
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}