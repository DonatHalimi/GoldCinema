import { AnimatePresence, motion } from 'framer-motion';
import {
    Bell,
    ChevronDown,
    ChevronsLeft,
    CircleDollarSign,
    CreditCard,
    Heart,
    LockKeyhole,
    LogOut,
    MessageSquare,
    MessagesSquare,
    Monitor,
    Settings,
    Shield,
    Ticket,
    Trash2,
    TriangleAlert,
    User,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { NavLink, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/AuthContext';

const EXPANDED_WIDTH = 256;
const COLLAPSED_WIDTH = 64;
const STORAGE_KEY = 'accountSidebar:expanded';

export default function AccountSidebar() {
    const { t } = useTranslation('accountSidebar');
    const { t: tNavbar } = useTranslation('navbar');

    const { logout } = useAuth();
    const navigate = useNavigate();

    const [expanded, setExpanded] = useState(() => {
        if (typeof window === 'undefined') return true;

        try {
            const stored = window.localStorage.getItem(STORAGE_KEY);
            return stored === null ? true : stored === 'true';
        } catch {
            return true;
        }
    });

    useEffect(() => {
        try {
            window.localStorage.setItem(STORAGE_KEY, String(expanded));
        } catch { }
    }, [expanded]);

    const ACCOUNT_SECTIONS = [
        {
            title: t('accountMenu'),
            icon: Settings,
            items: [
                { id: 'profile', label: t('profileItem'), icon: User },
                { id: 'settings', label: 'Settings', icon: Settings },
                { id: 'tickets', label: t('ticketsItem'), icon: Ticket },
                { id: 'favourites', label: t('favouritesItem'), icon: Heart },
            ],
        },
        {
            title: t('paymentMenu'),
            icon: CircleDollarSign,
            items: [
                { id: 'payments', label: t('paymentItem'), icon: CreditCard },
            ],
        },
        {
            title: t('securityMenu'),
            icon: LockKeyhole,
            items: [
                { id: 'security', label: t('securityItem'), icon: Shield },
                { id: 'sessions', label: t('sessionItem'), icon: Monitor },
            ],
        },
        {
            title: t('communicationMenu'),
            icon: MessagesSquare,
            items: [
                { id: 'notifications', label: t('notificationItem'), icon: Bell },
                { id: 'reviews', label: t('reviewsItem'), icon: MessageSquare },
            ],
        },
        {
            title: t('dangerZoneMenu'),
            icon: TriangleAlert,
            items: [
                { id: 'danger', label: t('dangerZoneItem'), icon: Trash2 },
            ],
        },
    ];

    const [openSections, setOpenSections] = useState(() => {
        const initialOpen = {};
        ACCOUNT_SECTIONS.forEach((section) => {
            initialOpen[section.title] = true;
        });
        return initialOpen;
    });

    const toggleSection = (title) => {
        setOpenSections((prev) => ({
            ...prev,
            [title]: !prev[title],
        }));
    };

    const handleLogout = async () => {
        try {
            await logout();
        } catch (error) {
            toast.error(error.response?.data?.error || tNavbar('logoutError'));
        } finally {
            navigate('/');
        }
    };

    return (
        <motion.aside
            initial={false}
            animate={{ width: expanded ? EXPANDED_WIDTH : COLLAPSED_WIDTH }}
            transition={{ type: 'spring', stiffness: 260, damping: 30 }}
            className="sticky top-24 z-30 flex shrink-0 flex-col self-start overflow-hidden rounded-xl border border-marquee-line bg-marquee-panel"
        >
            <AnimatePresence initial={false}>
                {expanded && (
                    <motion.div
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -8 }}
                        transition={{ duration: 0.15 }}
                        className="border-b border-marquee-line/60 px-3 pb-4 pt-4"
                    >
                        <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0">
                                <h2 className="font-display text-3xl font-semibold tracking-wide text-marquee-goldBright">
                                    {t('header')}
                                </h2>

                                <p className="mt-1 text-xs text-marquee-muted">
                                    {t('subheader')}
                                </p>
                            </div>

                            <motion.button
                                type="button"
                                onClick={() => setExpanded((v) => !v)}
                                whileTap={{ scale: 0.92 }}
                                whileHover={{ backgroundColor: 'rgba(230,199,115,0.12)' }}
                                className="grid h-8 w-8 shrink-0 place-items-center rounded-lg text-marquee-muted transition-colors hover:text-marquee-gold"
                                aria-label="Collapse sidebar"
                            >
                                <motion.span
                                    animate={{ rotate: 0 }}
                                    transition={{ type: 'spring', stiffness: 320, damping: 24 }}
                                    className="inline-flex"
                                >
                                    <ChevronsLeft className="h-4 w-4" />
                                </motion.span>
                            </motion.button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <AnimatePresence initial={false}>
                {!expanded && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.15 }}
                        className="flex justify-center border-b border-marquee-line/60 py-4"
                    >
                        <motion.button
                            type="button"
                            onClick={() => setExpanded((v) => !v)}
                            whileTap={{ scale: 0.92 }}
                            whileHover={{ backgroundColor: 'rgba(230,199,115,0.12)' }}
                            className="grid h-9 w-9 place-items-center rounded-lg text-marquee-muted transition-colors hover:text-marquee-gold"
                            aria-label="Expand sidebar"
                        >
                            <motion.span
                                initial={false}
                                animate={{ rotate: 180 }}
                                transition={{ type: 'spring', stiffness: 320, damping: 24 }}
                                className="inline-flex"
                            >
                                <ChevronsLeft className="h-4 w-4" />
                            </motion.span>
                        </motion.button>
                    </motion.div>
                )}
            </AnimatePresence>

            <nav className="relative flex-1 space-y-4 overflow-y-auto px-2 py-4">
                {ACCOUNT_SECTIONS.map((section) => {
                    const SectionIcon = section.icon;
                    const isOpen = openSections[section.title];

                    return (
                        <div key={section.title} className="space-y-1">
                            <AnimatePresence initial={false}>
                                {expanded && (
                                    <motion.button
                                        type="button"
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        exit={{ opacity: 0, height: 0 }}
                                        transition={{ duration: 0.15 }}
                                        onClick={() => toggleSection(section.title)}
                                        className="flex w-full items-center justify-between px-3 py-2 text-xs font-semibold uppercase tracking-wider text-marquee-muted transition-colors duration-200 hover:text-marquee-gold"
                                    >
                                        <div className="flex items-center gap-2 whitespace-nowrap">
                                            {SectionIcon && <SectionIcon size={14} />}
                                            <span>{section.title}</span>
                                        </div>

                                        <motion.div
                                            animate={{ rotate: isOpen ? 180 : 0 }}
                                            transition={{ duration: 0.2 }}
                                        >
                                            <ChevronDown size={14} />
                                        </motion.div>
                                    </motion.button>
                                )}
                            </AnimatePresence>

                            <AnimatePresence initial={false}>
                                {(!expanded || isOpen) && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        exit={{ opacity: 0, height: 0 }}
                                        transition={{ duration: 0.25, ease: 'easeInOut' }}
                                        className="space-y-1 overflow-hidden"
                                    >
                                        {section.items.map((item) => {
                                            const Icon = item.icon;

                                            return (
                                                <NavLink
                                                    key={item.id}
                                                    to={`/account/${item.id}`}
                                                    className={({ isActive }) => `
                                                        relative group flex w-full items-center gap-3
                                                        rounded-xl px-3 py-2.5 text-sm font-medium
                                                        border transition-all duration-300 z-10
                                                        ${isActive
                                                            ? 'text-marquee-goldBright font-bold border-transparent'
                                                            : 'text-marquee-muted border-transparent hover:text-marquee-goldBright hover:bg-marquee-gold/5 hover:border-marquee-gold/15 hover:shadow-[0_0_12px_-4px_rgba(230,199,115,0.25)]'
                                                        }
                                                    `}
                                                >
                                                    {({ isActive }) => (
                                                        <>
                                                            {isActive && (
                                                                <motion.div
                                                                    layoutId="activeAccountNavBg"
                                                                    transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                                                                    className="absolute inset-0 -z-10 rounded-xl border border-marquee-gold/20 bg-marquee-gold/10"
                                                                />
                                                            )}

                                                            <Icon
                                                                size={16}
                                                                className={`shrink-0 transition-colors duration-300 ${isActive
                                                                    ? 'text-marquee-gold'
                                                                    : 'text-marquee-muted/70 group-hover:text-marquee-gold'
                                                                    }`}
                                                            />

                                                            <AnimatePresence initial={false}>
                                                                {expanded && (
                                                                    <motion.span
                                                                        initial={{ opacity: 0, x: -6 }}
                                                                        animate={{ opacity: 1, x: 0 }}
                                                                        exit={{ opacity: 0, x: -6 }}
                                                                        transition={{ duration: 0.12 }}
                                                                        className="relative z-10 whitespace-nowrap tracking-wide"
                                                                    >
                                                                        {item.label}
                                                                    </motion.span>
                                                                )}
                                                            </AnimatePresence>
                                                        </>
                                                    )}
                                                </NavLink>
                                            );
                                        })}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    );
                })}
            </nav>

            <div className="border-t border-marquee-line/60 p-2">
                <button
                    type="button"
                    onClick={handleLogout}
                    className={`flex h-10 w-full items-center rounded-lg px-3 text-sm font-medium text-marquee-muted transition-colors hover:bg-red-500/10 hover:text-red-300 ${expanded ? 'gap-3' : 'justify-center'}`}
                >
                    <LogOut className="h-5 w-5 shrink-0" />

                    {expanded && (
                        <span className="whitespace-nowrap">
                            {tNavbar('logOut')}
                        </span>
                    )}
                </button>
            </div>
        </motion.aside>
    );
}