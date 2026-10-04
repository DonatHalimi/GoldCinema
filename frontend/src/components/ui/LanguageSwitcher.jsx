import { AnimatePresence, motion } from 'framer-motion';
import { Check, Globe } from 'lucide-react';
import { useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useClickOutside } from '../../hooks/useClickOutside';
import { setLocale } from '../../store/slices/localeSlice';
import { LOCALES } from '../../utils/locales';

const panelVariants = {
    hidden: { opacity: 0, y: -12, scale: 0.92, filter: 'blur(6px)' },
    visible: {
        opacity: 1,
        y: 0,
        scale: 1,
        filter: 'blur(0px)',
        transition: {
            type: 'spring',
            stiffness: 420,
            damping: 26,
            mass: 0.8,
            staggerChildren: 0.04,
            delayChildren: 0.05,
        },
    },
    exit: {
        opacity: 0,
        y: -8,
        scale: 0.96,
        filter: 'blur(4px)',
        transition: { duration: 0.15, ease: 'easeIn' },
    },
};

const itemVariants = {
    hidden: { opacity: 0, x: -8 },
    visible: {
        opacity: 1,
        x: 0,
        transition: { type: 'spring', stiffness: 500, damping: 30 },
    },
};

export default function LanguageSwitcher({ mobile = false }) {
    const current = useSelector((state) => state.locale.current);
    const dispatch = useDispatch();
    const [open, setOpen] = useState(false);
    const dropdownRef = useRef(null);

    useClickOutside(dropdownRef, () => setOpen(false), open);

    const currentLabel =
        LOCALES.find((l) => l.code === current)?.label || 'English';

    return (
        <div ref={dropdownRef} className={`relative ${mobile ? 'w-full' : ''}`}>
            <motion.button
                type="button"
                onClick={() => setOpen((prev) => !prev)}
                aria-haspopup="listbox"
                aria-expanded={open}
                whileTap={{ scale: 0.97 }}
                className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm text-marquee-muted transition hover:bg-white/[0.03] hover:text-marquee-gold"
            >
                <motion.span
                    animate={{
                        rotate: open ? 180 : 0,
                        scale: open ? 1.1 : 1,
                    }}
                    transition={{ type: 'spring', stiffness: 400, damping: 18 }}
                    className="inline-flex"
                >
                    <Globe size={16} />
                </motion.span>

                <span className="relative inline-block overflow-hidden">
                    <AnimatePresence mode="popLayout" initial={false}>
                        <motion.span
                            key={current}
                            initial={{ y: 8, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            exit={{ y: -8, opacity: 0 }}
                            transition={{
                                duration: 0.2,
                                ease: [0.16, 1, 0.3, 1],
                            }}
                            className="inline-block"
                        >
                            {currentLabel}
                        </motion.span>
                    </AnimatePresence>
                </span>
            </motion.button>

            <AnimatePresence>
                {open && (
                    <motion.div
                        role="listbox"
                        variants={panelVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        style={{ transformOrigin: mobile ? 'top center' : 'top right' }}
                        className={`absolute z-20 mt-2 w-40 overflow-hidden rounded-lg border border-marquee-line bg-marquee-panel2 shadow-xl ${mobile ? 'left-0 right-0' : 'right-0'
                            }`}
                    >
                        {LOCALES.map((locale) => {
                            const isActive = locale.code === current;

                            return (
                                <motion.button
                                    key={locale.code}
                                    variants={itemVariants}
                                    type="button"
                                    role="option"
                                    aria-selected={isActive}
                                    onClick={() => {
                                        dispatch(setLocale(locale.code));
                                        setOpen(false);
                                    }}
                                    className={`flex w-full items-center justify-between gap-2 px-3 py-2.5 text-left text-sm transition ${isActive
                                        ? 'bg-marquee-gold/10 text-marquee-gold'
                                        : 'text-marquee-cream hover:bg-marquee-line/30'
                                        }`}
                                >
                                    <span>{locale.label}</span>

                                    <AnimatePresence>
                                        {isActive && (
                                            <motion.span
                                                initial={{ scale: 0, opacity: 0 }}
                                                animate={{ scale: 1, opacity: 1 }}
                                                exit={{ scale: 0, opacity: 0 }}
                                                transition={{
                                                    type: 'spring',
                                                    stiffness: 500,
                                                    damping: 20,
                                                }}
                                                className="inline-flex"
                                            >
                                                <Check size={14} />
                                            </motion.span>
                                        )}
                                    </AnimatePresence>
                                </motion.button>
                            );
                        })}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}