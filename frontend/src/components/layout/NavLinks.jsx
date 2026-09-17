import { motion } from 'framer-motion';
import { useCallback, useRef } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import ThemeToggle from '../ui/ThemeToggle';
import NotificationBell from './NotificationBell';
import UserDropdown from './UserDropdown';
import LanguageSwitcher from '../ui/LanguageSwitcher';

const SPOTLIGHT_STYLE = {
    opacity: 'var(--spotlight-opacity, 0)',
    background:
        'radial-gradient(150px circle at var(--spotlight-x, 50%) var(--spotlight-y, 50%), rgba(198, 161, 91, 0.15), transparent 70%)',
};

export default function NavLinks({ mobile = false, onNavigate }) {
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
                Now Showing
            </NavItem>

            <NavItem to="/gift-cards" className={navLinkClass} onClick={onNavigate}>
                Gift Cards
            </NavItem>

            <ThemeToggle />
            <LanguageSwitcher mobile={mobile} />

            {!mobile && <div className="h-4 w-[1px] bg-white/10 mx-1" aria-hidden="true" />}

            {!user ? (
                <NavLink
                    to="/login"
                    onClick={onNavigate}
                    className={`relative ${mobile ? 'mt-2' : 'ml-1'} inline-flex items-center justify-center rounded-full bg-marquee-gold px-5 py-2 text-sm font-semibold text-marquee-bg shadow-sm transition-all duration-200 hover:bg-marquee-goldBright hover:shadow-marquee-gold/20 hover:shadow-lg active:scale-95`}
                >
                    Sign in
                </NavLink>
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
    return (
        <NavLink to={to} end={end} className={className} onClick={onClick}>
            {({ isActive }) => (
                <span className="relative inline-flex flex-col items-center justify-center py-1">
                    <span>{children}</span>
                    {isActive && (
                        <motion.span
                            layoutId="active-nav-indicator"
                            className="absolute -bottom-0.5 h-1 w-6 rounded-full bg-marquee-gold shadow-[0_0_12px_rgba(198,161,91,0.8),0_0_4px_rgba(198,161,91,1)]"
                            transition={{ type: 'spring', stiffness: 450, damping: 35 }}
                        />
                    )}
                </span>
            )}
        </NavLink>
    );
}