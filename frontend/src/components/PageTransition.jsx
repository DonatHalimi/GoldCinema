import { AnimatePresence, motion } from 'framer-motion';
import { useLocation } from 'react-router-dom';

const pageVariants = {
    initial: {
        opacity: 0,
        y: 10,
    },
    animate: {
        opacity: 1,
        y: 0,
        transition: {
            duration: 0.35,
            ease: [0.25, 0.8, 0.25, 1],
            when: 'beforeChildren',
            staggerChildren: 0.05,
        },
    },
    exit: {
        opacity: 0,
        y: -6,
        transition: {
            duration: 0.22,
            ease: [0.4, 0, 1, 1],
        },
    },
};

const overlayVariants = {
    initial: { opacity: 0.1 },
    animate: { opacity: 0, transition: { duration: 0.4, ease: 'easeOut' } },
    exit: { opacity: 0.1, transition: { duration: 0.18, ease: 'easeIn' } },
};

export default function PageTransition({ children }) {
    const location = useLocation();

    return (
        <AnimatePresence mode="wait" initial={false}>
            <motion.div
                key={location.pathname}
                variants={pageVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                style={{
                    width: '100%',
                    minHeight: '100vh',
                }}
            >
                <motion.div
                    variants={overlayVariants}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                    style={{
                        position: 'fixed',
                        inset: 0,
                        pointerEvents: 'none',
                        zIndex: 50,
                        background:
                            'radial-gradient(ellipse at center, rgba(255,215,0,0) 65%, rgba(255,215,0,0.06) 92%)',
                    }}
                />

                {children}
            </motion.div>
        </AnimatePresence>
    );
}