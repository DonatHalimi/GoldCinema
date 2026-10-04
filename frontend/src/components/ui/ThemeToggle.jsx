import { AnimatePresence, motion } from 'framer-motion';
import { Moon, Sun } from 'lucide-react';

import { useDispatch, useSelector } from 'react-redux';

import { toggleTheme } from '../../store/slices/themeSlice';

export default function ThemeToggle() {
    const mode = useSelector((state) => state.theme.mode);
    const dispatch = useDispatch();

    const isDark = mode === 'dark';

    return (
        <button
            type="button"
            onClick={() => dispatch(toggleTheme())}
            aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            className="group relative flex h-8 w-8 items-center justify-center overflow-hidden rounded-lg text-marquee-muted transition-colors duration-200 hover:bg-white/[0.03] hover:text-marquee-gold"
        >
            <AnimatePresence mode="wait" initial={false}>
                {isDark ? (
                    <motion.div
                        key="moon"
                        className="absolute inset-0 flex items-center justify-center"
                        initial={{
                            y: -20,
                            rotate: -45,
                            opacity: 0,
                            scale: 0.65,
                        }}
                        animate={{
                            y: 0,
                            rotate: 0,
                            opacity: 1,
                            scale: 1,
                        }}
                        exit={{
                            y: 20,
                            rotate: 45,
                            opacity: 0,
                            scale: 0.65,
                        }}
                        transition={{
                            duration: 0.4,
                            ease: [0.22, 1, 0.36, 1],
                        }}
                    >
                        <Moon
                            size={16}
                            strokeWidth={1.8}
                            className="drop-shadow-[0_0_5px_rgb(var(--color-goldBright)/0.2)]"
                        />
                    </motion.div>
                ) : (
                    <motion.div
                        key="sun"
                        className="absolute inset-0 flex items-center justify-center"
                        initial={{
                            y: 20,
                            rotate: 45,
                            opacity: 0,
                            scale: 0.65,
                        }}
                        animate={{
                            y: 0,
                            rotate: 0,
                            opacity: 1,
                            scale: 1,
                        }}
                        exit={{
                            y: -20,
                            rotate: -45,
                            opacity: 0,
                            scale: 0.65,
                        }}
                        transition={{
                            duration: 0.4,
                            ease: [0.22, 1, 0.36, 1],
                        }}
                    >
                        <Sun
                            size={16}
                            strokeWidth={1.8}
                            className="drop-shadow-[0_0_6px_rgb(var(--color-goldBright)/0.3)]"
                        />
                    </motion.div>
                )}
            </AnimatePresence>
        </button>
    );
}