import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';
import { useEffect, useId } from 'react';
import { createPortal } from 'react-dom';
import useEscapeKey from '../../../hooks/useEscKey';

let activeModalCount = 0;
let originalBodyOverflow = '';

function lockBodyScroll() {
    if (activeModalCount === 0) originalBodyOverflow = document.body.style.overflow;
    activeModalCount += 1;
    document.body.style.overflow = 'hidden';

    return () => {
        activeModalCount = Math.max(0, activeModalCount - 1);
        if (activeModalCount === 0) {
            document.body.style.overflow = originalBodyOverflow;
            originalBodyOverflow = '';
        }
    };
}

export default function Modal({
    isOpen,
    onClose,
    children,
    title,
    closeDisabled = false,
    showCloseButton = true,
    className = '',
    width = 'max-w-lg',
}) {
    const titleId = useId();

    useEscapeKey(
        () => {
            if (!closeDisabled) onClose();
        },
        isOpen && !closeDisabled
    );

    useEffect(() => {
        if (!isOpen) return;
        return lockBodyScroll();
    }, [isOpen]);

    if (!isOpen) {
        return null;
    }

    return createPortal(
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
                className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
            >
                <motion.div
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby={title ? titleId : undefined}
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
                    className={`relative w-full ${width} rounded-xl border border-marquee-line bg-marquee-bg p-6 shadow-2xl ${className}`}
                >
                    {(title || showCloseButton) && (
                        <div className="flex items-center justify-between border-b border-marquee-line/50 pb-3">
                            {title &&
                                <h2 id={titleId} className="font-display text-2xl font-semibold tracking-wide text-marquee-goldBright">
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
        </AnimatePresence>,
        document.body
    );
}