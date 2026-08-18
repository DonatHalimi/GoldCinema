import { AlertTriangle, LogOut } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

export default function SessionRevokeAllModal({
    isOpen,
    count,
    loading,
    onCancel,
    onConfirm,
}) {
    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={(event) => {
                        if (event.target === event.currentTarget) {
                            onCancel();
                        }
                    }}
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
                >
                    <motion.div
                        initial={{ scale: 0.94, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.94, opacity: 0 }}
                        transition={{
                            type: 'spring',
                            stiffness: 340,
                            damping: 28,
                        }}
                        className="w-full max-w-md rounded-2xl border border-marquee-line bg-marquee-panel p-6"
                    >
                        <div className="flex items-start gap-4">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-red-500/30 bg-red-500/10 text-red-400">
                                <AlertTriangle size={20} />
                            </div>

                            <div>
                                <h3 className="font-semibold text-marquee-cream">Sign out everywhere else?</h3>

                                <p className="mt-1 text-sm text-marquee-muted">
                                    This will immediately revoke{' '}
                                    <span className="font-semibold text-marquee-cream">
                                        {count} other session
                                        {count !== 1 ? 's' : ''}
                                    </span>
                                    . Anyone using those sessions will need to
                                    sign in again.
                                </p>
                            </div>
                        </div>

                        <div className="mt-6 flex justify-end gap-3">
                            <button
                                type="button"
                                onClick={onCancel}
                                disabled={loading}
                                className="rounded-lg border border-marquee-line px-4 py-2 text-sm text-marquee-muted transition hover:border-marquee-gold/30 hover:text-marquee-cream disabled:opacity-50"
                            >
                                Cancel
                            </button>

                            <button
                                id="confirm-revoke-all"
                                type="button"
                                onClick={onConfirm}
                                disabled={loading}
                                className="inline-flex items-center gap-2 rounded-lg bg-red-500/90 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-500 disabled:opacity-50"
                            >
                                <LogOut size={14} />

                                {loading ? 'Signing out…' : 'Sign out all others'}
                            </button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}