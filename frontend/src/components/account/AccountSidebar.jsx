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
import { NavLink } from 'react-router-dom';

const ACCOUNT_SECTIONS = [
    {
        title: 'Account',
        icon: Settings,
        items: [
            {
                id: 'profile',
                label: 'Profile',
                icon: User,
            },
            {
                id: 'tickets',
                label: 'Tickets',
                icon: Ticket,
            },
            {
                id: 'favourites',
                label: 'Favourites',
                icon: Heart,
            },
        ],
    },
    {
        title: 'Payments',
        icon: CircleDollarSign,
        items: [
            {
                id: 'payments',
                label: 'Payment Methods',
                icon: CreditCard,
            },
        ],
    },
    {
        title: 'Security & Privacy',
        icon: LockKeyhole,
        items: [
            {
                id: 'security',
                label: 'Security',
                icon: Shield,
            },
            {
                id: 'sessions',
                label: 'Sessions',
                icon: Monitor,
            },
        ],
    },
    {
        title: 'Communication',
        icon: MessagesSquare,
        items: [
            {
                id: 'notifications',
                label: 'Notifications',
                icon: Bell,
            },
            {
                id: 'reviews',
                label: 'My Reviews',
                icon: MessageSquare,
            },
        ],
    },
    {
        title: 'Danger Zone',
        icon: TriangleAlert,
        items: [
            {
                id: 'danger',
                label: 'Danger Zone',
                icon: Trash2,
            },
        ],
    },
];

export default function AccountSidebar() {
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
        <aside className="sticky top-24 w-64 rounded-xl border border-marquee-line bg-marquee-panel p-4">
            <div className="mb-6 px-3">
                <h2 className="font-display text-3xl font-semibold tracking-wide text-marquee-goldBright">
                    Account
                </h2>

                <p className="mt-1 text-xs text-marquee-muted">
                    Manage your account
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
                                <div className="flex items-center gap-2">
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
                                        initial={{
                                            opacity: 0,
                                            height: 0,
                                        }}
                                        animate={{
                                            opacity: 1,
                                            height: 'auto',
                                        }}
                                        exit={{
                                            opacity: 0,
                                            height: 0,
                                        }}
                                        transition={{
                                            duration: 0.25,
                                            ease: 'easeInOut',
                                        }}
                                        className="space-y-1 overflow-hidden pl-2"
                                    >
                                        {section.items.map((item) => {
                                            const Icon = item.icon;

                                            return (
                                                <NavLink
                                                    key={item.id}
                                                    to={`/account/${item.id}`}
                                                    className={({ isActive }) => `
                                                        relative group flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors duration-200 delay-100
                                                        ${isActive
                                                            ? 'z-10 text-marquee-bg'
                                                            : 'z-10 text-marquee-muted hover:bg-marquee-panel2 hover:text-marquee-gold'
                                                        }`}
                                                >
                                                    {({ isActive }) => (
                                                        <>
                                                            {isActive && (
                                                                <motion.div
                                                                    layoutId="activeAccountNav"
                                                                    className="absolute inset-0 -z-10 rounded-lg bg-marquee-gold shadow-[0_0_20px_rgba(212,175,55,0.25)]"
                                                                    transition={{
                                                                        type: 'spring',
                                                                        stiffness: 380,
                                                                        damping: 30,
                                                                    }}
                                                                />
                                                            )}

                                                            <Icon
                                                                size={16}
                                                                className={
                                                                    isActive
                                                                        ? 'text-marquee-bg'
                                                                        : 'text-marquee-muted group-hover:text-marquee-gold'
                                                                }
                                                            />

                                                            <span>{item.label}</span>
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