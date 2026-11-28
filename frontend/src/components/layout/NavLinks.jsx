import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import LanguageSwitcher from '../ui/LanguageSwitcher';
import ThemeToggle from '../ui/ThemeToggle';
import NotificationBell from './NotificationBell';
import UserDropdown from './UserDropdown';

const SPOTLIGHT_STYLE = {
    opacity: 'var(--spotlight-opacity, 0)',
    background:
        'radial-gradient(150px circle at var(--spotlight-x, 50%) var(--spotlight-y, 50%), rgba(198, 161, 91, 0.15), transparent 70%)',
};

export default function NavLinks({ mobile = false, onNavigate }) {
    return mobile ? <MobileNav onNavigate={onNavigate} /> : <DesktopNav />;
}

/* ───────────────────────────── Mobile / tablet ───────────────────────────── */

function MobileNav({ onNavigate }) {
    const { t } = useTranslation('navbar');
    const { user } = useAuth();

    return (
        <nav
            className="mx-auto flex w-full max-w-2xl min-w-0 flex-col gap-6 rounded-2xl border border-marquee-line bg-marquee-panel2 p-4 font-body shadow-2xl sm:p-6"
            aria-label="Main"
        >
            <MobileSection title={t('browse', { defaultValue: 'Browse' })}>
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                    <MobileLink to="/" end onClick={onNavigate}>
                        {t('nowShowing')}
                    </MobileLink>
                    <MobileLink to="/gift-cards" onClick={onNavigate}>
                        {t('giftCards')}
                    </MobileLink>
                </div>
            </MobileSection>

            <MobileSection
                title={t('preferences', { defaultValue: 'Preferences' })}
            >
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                    <MobileRow
                        label={t('theme', { defaultValue: 'Theme' })}
                    >
                        <ThemeToggle />
                    </MobileRow>
                    <MobileRow
                        label={t('language', { defaultValue: 'Language' })}
                    >
                        <LanguageSwitcher mobile />
                    </MobileRow>
                </div>
            </MobileSection>

            <div className="h-px w-full bg-marquee-line" aria-hidden="true" />

            <MobileSection
                title={t('account', { defaultValue: 'Account' })}
            >
                {!user ? (
                    <NavLink
                        to="/login"
                        onClick={onNavigate}
                        className="inline-flex min-h-[48px] w-full min-w-0 items-center justify-center truncate rounded-xl bg-gradient-to-r from-marquee-gold to-marquee-goldBright px-5 py-3 text-base font-semibold text-marquee-bg shadow-lg shadow-marquee-gold/25 transition-all hover:brightness-105 active:scale-[0.98]"
                    >
                        Login
                    </NavLink>
                ) : (
                    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                        <MobileRow
                            label={t('notifications', {
                                defaultValue: 'Notifications',
                            })}
                        >
                            <NotificationBell />
                        </MobileRow>
                        <MobileRow
                            label={t('profile', {
                                defaultValue: 'Profile',
                            })}
                        >
                            <UserDropdown />
                        </MobileRow>
                    </div>
                )}
            </MobileSection>
        </nav>
    );
}

function MobileSection({ title, children }) {
    return (
        <section className="flex min-w-0 flex-col gap-2.5">
            <h2 className="min-w-0 px-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-marquee-gold">
                {title}
            </h2>
            {children}
        </section>
    );
}

function MobileLink({ to, end, onClick, children }) {
    return (
        <NavLink
            to={to}
            end={end}
            onClick={onClick}
            className={({ isActive }) =>
                `flex min-h-[50px] min-w-0 items-center justify-between gap-3 rounded-xl border px-4 py-2.5 text-base font-medium transition-all duration-200 ${isActive
                    ? 'border-marquee-gold/60 bg-marquee-bg text-marquee-gold shadow-sm'
                    : 'border-marquee-line bg-marquee-bg text-marquee-cream hover:border-marquee-gold/40 hover:text-marquee-gold active:scale-[0.99]'
                }`
            }
        >
            {({ isActive }) => (
                <>
                    <span className="min-w-0 truncate">{children}</span>
                    {isActive && (
                        <span
                            aria-hidden="true"
                            className="h-2.5 w-2.5 shrink-0 rounded-full bg-marquee-gold shadow-[0_0_8px_rgba(198,161,91,0.85)]"
                        />
                    )}
                </>
            )}
        </NavLink>
    );
}

function MobileRow({ label, children }) {
    return (
        <div className="flex min-h-[50px] min-w-0 items-center justify-between gap-3 rounded-xl border border-marquee-line bg-marquee-bg px-4 py-2.5">
            <span className="min-w-0 truncate text-base font-medium text-marquee-cream">
                {label}
            </span>
            <div className="flex shrink-0 items-center">{children}</div>
        </div>
    );
}

/* ─────────────────────────────── Desktop ─────────────────────────────── */

function DesktopNav() {
    const { t } = useTranslation('navbar');
    const { user } = useAuth();
    const containerRef = useRef(null);

    const handleMouseMove = useCallback((e) => {
        const node = containerRef.current;
        if (!node) return;
        const rect = node.getBoundingClientRect();
        node.style.setProperty('--spotlight-x', `${e.clientX - rect.left}px`);
        node.style.setProperty('--spotlight-y', `${e.clientY - rect.top}px`);
        node.style.setProperty('--spotlight-opacity', '1');
    }, []);

    const handleMouseLeave = useCallback(() => {
        containerRef.current?.style.setProperty('--spotlight-opacity', '0');
    }, []);

    const navLinkClass = ({ isActive }) =>
        `group relative rounded-lg px-3 py-1.5 text-sm font-medium transition-colors duration-200 ${isActive
            ? 'text-marquee-gold'
            : 'text-marquee-muted hover:text-marquee-gold hover:bg-white/[0.03]'
        }`;

    return (
        <nav
            ref={containerRef}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            className="relative flex items-center gap-2 overflow-visible rounded-2xl border border-[rgb(var(--color-pill-tint)/var(--pill-border-opacity))] bg-[rgb(var(--color-pill-tint)/var(--pill-bg-opacity))] px-3 py-1.5 font-body backdrop-blur-md"
        >
            <div
                className="pointer-events-none absolute -inset-px rounded-2xl transition-opacity duration-300"
                style={SPOTLIGHT_STYLE}
            />

            <NavItem to="/" end className={navLinkClass}>
                {t('nowShowing')}
            </NavItem>

            <NavItem to="/gift-cards" className={navLinkClass}>
                {t('giftCards')}
            </NavItem>

            <ThemeToggle />
            <LanguageSwitcher />

            <div
                className="mx-1 h-4 w-[1px] bg-white/10"
                aria-hidden="true"
            />

            {!user ? (
                <motion.div
                    whileTap={{ scale: 0.94 }}
                    transition={{
                        type: 'spring',
                        stiffness: 500,
                        damping: 30,
                    }}
                    className="relative ml-1 inline-flex"
                >
                    <NavLink
                        to="/login"
                        className="inline-flex items-center justify-center rounded-full bg-marquee-gold px-5 py-2 text-sm font-semibold text-marquee-bg shadow-sm transition-all duration-200 hover:bg-marquee-goldBright hover:shadow-lg hover:shadow-marquee-gold/20"
                    >
                        Login
                    </NavLink>
                </motion.div>
            ) : (
                <div className="flex items-center gap-2.5 overflow-visible pl-1">
                    <NotificationBell />
                    <UserDropdown />
                </div>
            )}
        </nav>
    );
}

function NavItem({ to, end, className, children }) {
    const [ripples, setRipples] = useState([]);
    const timeoutsRef = useRef(new Set());

    const mx = useMotionValue(0);
    const my = useMotionValue(0);
    const sx = useSpring(mx, { stiffness: 250, damping: 22 });
    const sy = useSpring(my, { stiffness: 250, damping: 22 });
    const rotateX = useTransform(sy, [-6, 6], [4, -4]);
    const rotateY = useTransform(sx, [-6, 6], [-4, 4]);

    useEffect(() => {
        const timers = timeoutsRef.current;
        return () => {
            timers.forEach((timerId) => clearTimeout(timerId));
            timers.clear();
        };
    }, []);

    const handleMouseMove = (e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        mx.set((e.clientX - rect.left - rect.width / 2) / 6);
        my.set((e.clientY - rect.top - rect.height / 2) / 6);
    };

    const handleMouseLeave = () => {
        mx.set(0);
        my.set(0);
    };

    const handleClick = (e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const id = Date.now() + Math.random();
        setRipples((r) => [
            ...r,
            { id, x: e.clientX - rect.left, y: e.clientY - rect.top },
        ]);
        const timerId = setTimeout(() => {
            setRipples((r) => r.filter((rp) => rp.id !== id));
            timeoutsRef.current.delete(timerId);
        }, 650);
        timeoutsRef.current.add(timerId);
    };

    return (
        <NavLink
            to={to}
            end={end}
            className={className}
            onClick={handleClick}
        >
            {({ isActive }) => (
                <motion.span
                    onMouseMove={handleMouseMove}
                    onMouseLeave={handleMouseLeave}
                    style={{ rotateX, rotateY, transformPerspective: 600 }}
                    whileHover={{ scale: 1.03, y: -1 }}
                    whileTap={{ scale: 0.9, y: 1 }}
                    transition={{
                        type: 'spring',
                        stiffness: 480,
                        damping: 26,
                        mass: 0.6,
                    }}
                    className="relative inline-flex flex-col items-center justify-center overflow-visible px-1.5 py-1"
                >
                    <span className="relative z-10 inline-block">
                        {children}
                    </span>

                    {ripples.map((r) => (
                        <motion.span
                            key={`glow-${r.id}`}
                            aria-hidden="true"
                            style={{
                                left: r.x,
                                top: r.y,
                                translate: '-50% -50%',
                                background:
                                    'radial-gradient(circle, rgba(198,161,91,0.24) 0%, rgba(198,161,91,0.10) 40%, rgba(198,161,91,0) 70%)',
                            }}
                            initial={{ width: 0, height: 0, opacity: 0.7 }}
                            animate={{ width: 80, height: 80, opacity: 0 }}
                            transition={{ duration: 0.5, ease: 'easeOut' }}
                            className="pointer-events-none absolute rounded-full"
                        />
                    ))}

                    {ripples.map((r) => (
                        <span
                            key={`ripple-${r.id}`}
                            aria-hidden="true"
                            style={{
                                left: r.x,
                                top: r.y,
                                translate: '-50% -50%',
                            }}
                            className="pointer-events-none absolute"
                        >
                            <motion.span
                                initial={{
                                    width: 0,
                                    height: 0,
                                    opacity: 0.55,
                                }}
                                animate={{
                                    width: 34,
                                    height: 34,
                                    opacity: 0,
                                }}
                                transition={{
                                    duration: 0.45,
                                    ease: 'easeOut',
                                }}
                                style={{ translate: '-50% -50%' }}
                                className="absolute rounded-full bg-marquee-gold/20"
                            />
                            <motion.span
                                initial={{
                                    width: 0,
                                    height: 0,
                                    opacity: 0.45,
                                }}
                                animate={{
                                    width: 48,
                                    height: 48,
                                    opacity: 0,
                                }}
                                transition={{
                                    duration: 0.6,
                                    ease: 'easeOut',
                                    delay: 0.05,
                                }}
                                style={{ translate: '-50% -50%' }}
                                className="absolute rounded-full border border-marquee-gold/25"
                            />
                        </span>
                    ))}

                    {isActive && (
                        <>
                            <motion.span
                                layoutId="active-nav-indicator"
                                transition={{
                                    type: 'spring',
                                    stiffness: 450,
                                    damping: 35,
                                }}
                                className="absolute -bottom-0.5 h-1 w-6 rounded-full bg-marquee-gold shadow-[0_0_12px_rgba(198,161,91,0.8),0_0_4px_rgba(198,161,91,1)]"
                            />
                            <motion.span
                                aria-hidden="true"
                                className="pointer-events-none absolute -bottom-1 h-3 w-10 rounded-full bg-marquee-gold/40 blur-md"
                                animate={{
                                    opacity: [0.35, 0.7, 0.35],
                                    scale: [1, 1.15, 1],
                                }}
                                transition={{
                                    duration: 2.6,
                                    repeat: Infinity,
                                    ease: 'easeInOut',
                                }}
                            />
                        </>
                    )}
                </motion.span>
            )}
        </NavLink>
    );
}