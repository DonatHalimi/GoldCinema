import { AnimatePresence, motion } from 'framer-motion';
import { ChevronDown, Heart, LayoutDashboard, LogOut, Ticket, User2 } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/AuthContext';
import Avatar from '../ui/Avatar';
import RoleSwitcher from './RoleSwitcher';
import { usePermissions } from '../../hooks/usePermissions';
import { hasPermission } from '../../utils/permissions';

const panelVariants = {
    hidden: { opacity: 0, y: -12, scale: 0.92, filter: 'blur(6px)' },
    visible: { opacity: 1, y: 0, scale: 1, filter: 'blur(0px)', transition: { type: 'spring', stiffness: 420, damping: 26, mass: 0.8, staggerChildren: 0.05, delayChildren: 0.06 } },
    exit: { opacity: 0, y: -8, scale: 0.96, filter: 'blur(4px)', transition: { duration: 0.15, ease: 'easeIn' } },
};
const itemVariants = { hidden: { opacity: 0, x: -10 }, visible: { opacity: 1, x: 0, transition: { type: 'spring', stiffness: 500, damping: 30 } } };

function roleName(role) {
    if (!role) return '';
    return String(typeof role === 'object' ? role.name : role).toLowerCase();
}

export default function UserDropdown() {
    const { t } = useTranslation('navbar');
    const { user, logout } = useAuth();
    const { permissions } = usePermissions();
    const navigate = useNavigate();
    const [open, setOpen] = useState(false);
    const dropdownRef = useRef(null);

    const displayName = user?.name ? user.name.split(' ')[0] : user?.email?.split('@')[0] || t('user');
    const activeRole = roleName(user?.activeRole || user?.role);
    const isAdmin = hasPermission(permissions, 'admin:access') || hasPermission(permissions, 'users:read');
    const isCinemaManager = activeRole === 'cinema_manager';
    const handleLogout = async () => {
        setOpen(false);
        try {
            await logout();
        } catch (error) {
            toast.error(error.response?.data?.error || t('logoutError'));
        } finally {
            navigate('/');
        }
    };

    useEffect(() => {
        function handleClickOutside(event) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) setOpen(false);
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const menuItems = [
        { label: t('account'), to: '/account', icon: User2 },
        ...(isAdmin ? [{ label: t('dashboard'), to: '/admin/users', icon: LayoutDashboard }] : []),
        ...(isCinemaManager ? [{ label: 'Cinema management', to: '/admin/staff', icon: LayoutDashboard }] : []),
        { label: t('myTickets'), to: '/account/tickets', icon: Ticket },
        { label: t('favourites'), to: '/account/favourites', icon: Heart },
    ];

    return (
        <div ref={dropdownRef} className="relative">
            <motion.button type="button" onClick={() => setOpen((prev) => !prev)} whileTap={{ scale: 0.96 }} aria-expanded={open} className="flex items-center gap-2 rounded-full border border-marquee-line bg-marquee-panel2 px-2 py-1 text-marquee-cream transition hover:border-marquee-gold">
                <Avatar name={user?.name} avatar={user?.avatar} size="sm" />
                <span>{displayName}</span>
                <motion.span animate={{ rotate: open ? 180 : 0 }} transition={{ type: 'spring', stiffness: 400, damping: 22 }} className="inline-flex"><ChevronDown size={16} /></motion.span>
            </motion.button>

            <AnimatePresence>
                {open && (
                    <motion.div variants={panelVariants} initial="hidden" animate="visible" exit="exit" style={{ transformOrigin: 'top right' }} className="absolute right-0 z-50 mt-3 w-72 origin-top-right overflow-visible rounded-xl border border-marquee-line bg-marquee-panel shadow-2xl">
                        <motion.div variants={itemVariants} className="flex items-center gap-3 rounded-t-xl border-b border-marquee-line px-3 py-4">
                            <Avatar name={user?.name} avatar={user?.avatar} size="sm" />
                            <div className="min-w-0"><p className="truncate font-semibold text-marquee-cream">{displayName}</p><p className="truncate text-xs text-marquee-muted">{user?.email}</p></div>
                        </motion.div>

                        <div className="space-y-2 p-2">
                            <motion.div variants={itemVariants}>
                                <RoleSwitcher onSwitchComplete={() => setOpen(false)} />
                            </motion.div>
                            <div className="flex flex-col">
                                {menuItems.map(({ label, to, icon: Icon }) => (
                                    <motion.div key={to} variants={itemVariants}>
                                        <Link to={to} onClick={() => setOpen(false)} className="flex items-center gap-3 rounded-lg px-4 py-3 text-sm text-marquee-muted transition hover:bg-marquee-panel2 hover:text-marquee-gold"><Icon size={18} />{label}</Link>
                                    </motion.div>
                                ))}
                                <motion.div variants={itemVariants}>
                                    <button type="button" onClick={handleLogout} className="flex w-full items-center gap-3 rounded-lg border-t border-marquee-line px-4 py-3 text-left text-sm text-red-400 transition hover:bg-red-500/10"><LogOut size={18} />{t('logOut')}</button>
                                </motion.div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}