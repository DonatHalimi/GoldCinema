import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { useCallback, useRef, useState } from 'react';
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
        `group relative px-3 py-1.5 text-sm font-medium transition-colors duration-200 rounded-lg ${isActive
            ? 'text-marquee-gold'
            : 'text-marquee-muted hover:text-marquee-gold hover:bg-white/[0.03]'
        }`;

    const layout = mobile
        ? 'flex flex-col items-stretch gap-1 font-body'
        : 'relative flex items-center gap-2 font-body px-3 py-1.5 rounded-2xl border border-[rgb(var(--color-pill-tint)/var(--pill-border-opacity))] bg-[rgb(var(--color-pill-tint)/var(--pill-bg-opacity))] backdrop-blur-md overflow-visible';

    return (
        <nav
            ref={containerRef}
            onMouseMove={mobile ? undefined : handleMouseMove}
            onMouseLeave={mobile ? undefined : handleMouseLeave}
            className={layout}
        >
            {!mobile && (
                <div
                    className="pointer-events-none absolute -inset-px rounded-2xl transition-opacity duration-300"
                    style={SPOTLIGHT_STYLE}
                />
            )}

            <NavItem to="/" end className={navLinkClass} onClick={onNavigate}>
                {t('nowShowing')}
            </NavItem>

            <NavItem to="/gift-cards" className={navLinkClass} onClick={onNavigate}>
                {t('giftCards')}
            </NavItem>

            <ThemeToggle />
            <LanguageSwitcher mobile={mobile} />

            {!mobile && <div className="h-4 w-[1px] bg-white/10 mx-1" aria-hidden="true" />}

            {!user ? (
                <motion.div
                    whileTap={{ scale: 0.94 }}
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                    className={`relative ${mobile ? 'mt-2' : 'ml-1'} inline-flex`}
                >
                    <NavLink
                        to="/login"
                        onClick={onNavigate}
                        className="inline-flex items-center justify-center rounded-full bg-marquee-gold px-5 py-2 text-sm font-semibold text-marquee-bg shadow-sm transition-all duration-200 hover:bg-marquee-goldBright hover:shadow-marquee-gold/20 hover:shadow-lg"
                    >
                        Login
                    </NavLink>
                </motion.div>
            ) : (
                <div className={`flex items-center gap-2.5 ${mobile ? 'mt-2' : 'pl-1'} overflow-visible`}>
                    <NotificationBell />
                    <UserDropdown />
                </div>
            )}
        </nav>
    );
}

function NavItem({ to, end, className, children, onClick }) {
    const [ripples, setRipples] = useState([]);

    // Magnetic tilt
    const mx = useMotionValue(0);
    const my = useMotionValue(0);
    const sx = useSpring(mx, { stiffness: 250, damping: 22 });
    const sy = useSpring(my, { stiffness: 250, damping: 22 });
    const rotateX = useTransform(sy, [-6, 6], [4, -4]);
    const rotateY = useTransform(sx, [-6, 6], [-4, 4]);

    const handleMouseMove = (e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const px = e.clientX - rect.left - rect.width / 2;
        const py = e.clientY - rect.top - rect.height / 2;
        mx.set(px / 6);
        my.set(py / 6);
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
        setTimeout(() => {
            setRipples((r) => r.filter((rp) => rp.id !== id));
        }, 650);
        onClick?.(e);
    };

    return (
        <NavLink to={to} end={end} className={className} onClick={handleClick}>
            {({ isActive }) => (
                <motion.span
                    onMouseMove={handleMouseMove}
                    onMouseLeave={handleMouseLeave}
                    style={{ rotateX, rotateY, transformPerspective: 600 }}
                    whileHover={{ scale: 1.03, y: -1 }}
                    whileTap={{ scale: 0.9, y: 1 }}
                    transition={{ type: 'spring', stiffness: 480, damping: 26, mass: 0.6 }}
                    className="relative inline-flex flex-col items-center justify-center py-1 px-1.5 overflow-visible"
                >
                    {/* Label — inherits parent scale so text shrinks on press */}
                    <span className="relative z-10 inline-block">
                        {children}
                    </span>

                    {/* Click-anchored glow burst (behind ripples) */}
                    {ripples.map((r) => (
                        <motion.span
                            key={`glow-${r.id}`}
                            aria-hidden="true"
                            className="pointer-events-none absolute rounded-full"
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
                        />
                    ))}

                    {/* Minimal double ripple from click point */}
                    {ripples.map((r) => (
                        <span
                            key={`ripple-${r.id}`}
                            aria-hidden="true"
                            className="pointer-events-none absolute"
                            style={{ left: r.x, top: r.y, translate: '-50% -50%' }}
                        >
                            <motion.span
                                className="absolute rounded-full bg-marquee-gold/20"
                                initial={{ width: 0, height: 0, opacity: 0.55 }}
                                animate={{ width: 34, height: 34, opacity: 0 }}
                                transition={{ duration: 0.45, ease: 'easeOut' }}
                                style={{ translate: '-50% -50%' }}
                            />
                            <motion.span
                                className="absolute rounded-full border border-marquee-gold/25"
                                initial={{ width: 0, height: 0, opacity: 0.45 }}
                                animate={{ width: 48, height: 48, opacity: 0 }}
                                transition={{ duration: 0.6, ease: 'easeOut', delay: 0.05 }}
                                style={{ translate: '-50% -50%' }}
                            />
                        </span>
                    ))}

                    {/* Active indicator */}
                    {isActive && (
                        <>
                            <motion.span
                                layoutId="active-nav-indicator"
                                className="absolute -bottom-0.5 h-1 w-6 rounded-full bg-marquee-gold shadow-[0_0_12px_rgba(198,161,91,0.8),0_0_4px_rgba(198,161,91,1)]"
                                transition={{ type: 'spring', stiffness: 450, damping: 35 }}
                            />
                            <motion.span
                                aria-hidden="true"
                                className="pointer-events-none absolute -bottom-1 h-3 w-10 rounded-full blur-md bg-marquee-gold/40"
                                animate={{ opacity: [0.35, 0.7, 0.35], scale: [1, 1.15, 1] }}
                                transition={{ duration: 2.6, repeat: Infinity, ease: 'easeInOut' }}
                            />
                        </>
                    )}
                </motion.span>
            )}
        </NavLink>
    );
}