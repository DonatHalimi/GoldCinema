import { animate, motion, useMotionValue, useReducedMotion, useTransform } from 'framer-motion';
import { ArrowRight, Check, Loader2 } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

const HANDLE_SIZE = 48;
const PADDING = 4;
const DEFAULT_THRESHOLD = 0.85;
const DESKTOP_THRESHOLD = 0.9;

function isTouchDevice() {
    if (typeof window === 'undefined') return false;
    return window.matchMedia?.('(hover: none)').matches ?? false;
}

export default function SlideToConfirm({ label, ariaLabel, onConfirm, loading = false, price }) {
    const trackRef = useRef(null);
    const firedRef = useRef(false);
    const [max, setMax] = useState(0);
    const [phase, setPhase] = useState('idle');
    const [isTouch, setIsTouch] = useState(false);
    const x = useMotionValue(0);
    const reduceMotion = useReducedMotion();

    const threshold = isTouch ? DEFAULT_THRESHOLD : DESKTOP_THRESHOLD;

    const fillWidth = useTransform(x, (v) => Math.max(HANDLE_SIZE + PADDING * 2, v + HANDLE_SIZE + PADDING * 2));
    const labelOpacity = useTransform(x, [0, 70], [1, 0]);
    const progress = useTransform(x, (v) => (max > 0 ? Math.min(1, v / max) : 0));
    const glowOpacity = useTransform(progress, [0, 0.55, 1], [0.12, 0.35, 0.7]);
    const glowScale = useTransform(progress, [0, 1], [0.95, 1.15]);
    const fillOpacity = useTransform(progress, [0, 1], [0.5, 1]);
    const trailOpacity = useTransform(progress, [0, 0.25, 1], [0, 0.45, 1]);
    const handleScale = useTransform(x, (v) => {
        if (max === 0) return 1;
        const p = Math.min(1, v / max);
        return 1 + p * 0.06;
    });

    const morphLabel = useTransform(() => {
        if (phase === 'loading') return 'Processing…';
        if (phase === 'confirm') return price ? `Release to confirm ${price}` : 'Release to confirm';
        return label;
    });

    useEffect(() => {
        setIsTouch(isTouchDevice());
    }, []);

    useEffect(() => {
        const node = trackRef.current;
        if (!node) return undefined;

        const observer = new ResizeObserver(([entry]) => {
            setMax(Math.max(0, entry.contentRect.width - HANDLE_SIZE - PADDING * 2));
        });
        observer.observe(node);
        return () => observer.disconnect();
    }, []);

    useEffect(() => {
        if (loading) {
            setPhase('loading');
            return;
        }
        setPhase('idle');
        firedRef.current = false;
        animate(x, 0, { duration: reduceMotion ? 0 : 0.25, ease: [0.22, 1, 0.36, 1] });
    }, [loading, reduceMotion, x]);

    function buzz(pattern = 12) {
        if (!isTouch) return;
        try {
            navigator.vibrate?.(pattern);
        } catch {
            /* noop */
        }
    }

    function fire() {
        if (firedRef.current || loading) return;
        firedRef.current = true;
        setPhase('loading');
        buzz([10, 20, 14]);
        onConfirm();
    }

    function handleDrag() {
        if (max === 0 || loading) return;
        const ratio = x.get() / max;
        const next = ratio >= threshold ? 'confirm' : 'idle';
        if (next !== phase && phase !== 'loading') {
            if (next === 'confirm') buzz(8);
            setPhase(next);
        }
    }

    function handleDragEnd() {
        if (max > 0 && x.get() >= max * threshold) {
            animate(x, max, { duration: reduceMotion ? 0 : 0.18, ease: [0.22, 1, 0.36, 1] });
            fire();
        } else {
            setPhase('idle');
            animate(x, 0, { type: 'spring', stiffness: 520, damping: 26, mass: 0.7 });
        }
    }

    function handleKeyDown(e) {
        if (['Enter', ' ', 'ArrowRight'].includes(e.key)) {
            e.preventDefault();
            fire();
        }
    }

    const disableMotion = reduceMotion;

    return (
        <div
            ref={trackRef}
            className="relative h-14 select-none overflow-hidden rounded-full border border-marquee-gold/40 bg-marquee-panel2 p-1 touch-pan-y"
        >
            <motion.div
                aria-hidden="true"
                style={{ width: fillWidth, opacity: disableMotion ? 1 : fillOpacity }}
                className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-marquee-gold/15 via-marquee-gold/35 to-marquee-gold/70"
            />

            {!disableMotion && (
                <motion.div
                    aria-hidden="true"
                    style={{ width: fillWidth, opacity: trailOpacity }}
                    className="pointer-events-none absolute inset-y-0 left-0 overflow-hidden rounded-full"
                >
                    <div
                        className="absolute inset-y-0 right-0 w-16"
                        style={{
                            background: 'linear-gradient(90deg, transparent 0%, rgba(198,161,91,0.9) 100%)',
                            filter: 'blur(6px)',
                        }}
                    />
                </motion.div>
            )}

            <motion.span
                aria-hidden="true"
                style={{ opacity: labelOpacity }}
                className="pointer-events-none absolute inset-0 flex items-center justify-center pl-12 text-sm font-semibold text-marquee-muted"
            >
                {morphLabel}
            </motion.span>

            {!disableMotion && (
                <motion.div
                    aria-hidden="true"
                    style={{ x, opacity: glowOpacity, scale: glowScale }}
                    className="pointer-events-none absolute left-1 top-1 z-0 h-12 w-12 rounded-full"
                >
                    <div
                        className="h-full w-full rounded-full"
                        style={{
                            background:
                                'radial-gradient(circle, rgba(198,161,91,0.85) 0%, rgba(198,161,91,0.4) 45%, transparent 75%)',
                        }}
                    />
                </motion.div>
            )}

            <motion.button
                type="button"
                aria-label={ariaLabel}
                drag={loading ? false : 'x'}
                dragConstraints={{ left: 0, right: max }}
                dragElastic={0}
                dragMomentum={false}
                style={{ x, scale: disableMotion ? 1 : handleScale }}
                onDrag={handleDrag}
                onDragEnd={handleDragEnd}
                onKeyDown={handleKeyDown}
                onClick={(e) => { if (e.detail === 0) fire(); }}
                onContextMenu={(e) => e.preventDefault()}
                className="relative z-10 flex h-12 w-12 cursor-grab touch-none items-center justify-center rounded-full bg-gradient-to-br from-marquee-goldBright to-marquee-gold text-marquee-bg shadow-lg shadow-marquee-gold/25 active:cursor-grabbing"
            >
                {!disableMotion && !loading && (
                    <motion.span
                        aria-hidden="true"
                        className="pointer-events-none absolute inset-0 rounded-full"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: [0.45, 0, 0.45] }}
                        transition={{ duration: 2.6, repeat: Infinity, ease: 'easeInOut' }}
                        style={{
                            background:
                                'radial-gradient(circle at 30% 30%, rgba(255,255,255,0.45), transparent 62%)',
                        }}
                    />
                )}

                {!disableMotion && !loading && (
                    <motion.span
                        aria-hidden="true"
                        className="pointer-events-none absolute inset-0 overflow-hidden rounded-full"
                    >
                        <motion.span
                            className="absolute -inset-y-2 -left-1/3 w-1/3 rotate-12 bg-white/45 blur-md"
                            animate={{ x: ['0%', '420%'] }}
                            transition={{
                                duration: 2.1,
                                repeat: Infinity,
                                ease: 'easeInOut',
                                repeatDelay: 1.1,
                            }}
                        />
                    </motion.span>
                )}

                <span className="relative z-10 flex items-center justify-center">
                    {loading ? (
                        <motion.span
                            key="spinner"
                            initial={{ opacity: 0, scale: 0.55, rotate: -60 }}
                            animate={{ opacity: 1, scale: 1, rotate: 0 }}
                            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
                        >
                            <Loader2 className="h-5 w-5 animate-spin" />
                        </motion.span>
                    ) : phase === 'confirm' ? (
                        <motion.span
                            key="check"
                            initial={{ opacity: 0, scale: 0.5 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
                        >
                            <Check className="h-5 w-5" strokeWidth={3} />
                        </motion.span>
                    ) : (
                        <motion.span
                            key="arrow"
                            initial={{ opacity: 0, x: -6 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
                        >
                            <ArrowRight className="h-5 w-5" />
                        </motion.span>
                    )}
                </span>
            </motion.button>
        </div>
    );
}