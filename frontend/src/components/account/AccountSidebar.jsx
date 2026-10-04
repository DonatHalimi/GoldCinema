import { AnimatePresence, motion } from 'framer-motion';
import {
    Bell,
    ChevronDown,
    CircleDollarSign,
    CreditCard,
    Heart,
    LockKeyhole,
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
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { NavLink } from 'react-router-dom';

export default function AccountSidebar() {
    const { t } = useTranslation('accountSidebar');

    const ACCOUNT_SECTIONS = [
        {
            title: t('accountMenu'),
            icon: Settings,
            items: [
                { id: 'profile', label: t('profileItem'), icon: User },
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

    return (
        <aside className="sticky top-24 self-start w-64 shrink-0 rounded-xl border border-marquee-line bg-marquee-panel p-4">
            <div className="mb-6 px-3">
                <h2 className="font-display text-3xl font-semibold tracking-wide text-marquee-goldBright">
                    {t('header')}
                </h2>

                <p className="mt-1 text-xs text-marquee-muted">
                    {t('subheader')}
                </p>
            </div>

            <nav className="relative space-y-4">
                {ACCOUNT_SECTIONS.map((section) => {
                    const SectionIcon = section.icon;
                    const isOpen = openSections[section.title];

                    return (
                        <div key={section.title} className="space-y-1">
                            <button
                                type="button"
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
                            </button>

                            <AnimatePresence initial={false}>
                                {isOpen && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        exit={{ opacity: 0, height: 0 }}
                                        transition={{ duration: 0.25, ease: 'easeInOut' }}
                                        className="space-y-1 overflow-hidden pl-2"
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
                                                                    className="absolute inset-0 rounded-xl bg-marquee-gold/10 border border-marquee-gold/20 -z-10"
                                                                />
                                                            )}

                                                            <Icon
                                                                size={16}
                                                                className={`transition-colors duration-300 ${isActive
                                                                    ? 'text-marquee-gold'
                                                                    : 'text-marquee-muted/70 group-hover:text-marquee-gold'
                                                                    }`}
                                                            />

                                                            <span className="tracking-wide">{item.label}</span>
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
        </aside>
    );
}