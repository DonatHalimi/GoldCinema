import {
    User,
    Shield,
    Bell,
    CreditCard,
    Monitor,
    Trash2,
    Ticket,
} from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';

const items = [
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
        id: 'security',
        label: 'Security',
        icon: Shield,
    },
    {
        id: 'notifications',
        label: 'Notifications',
        icon: Bell,
    },
    {
        id: 'sessions',
        label: 'Sessions',
        icon: Monitor,
    },
    {
        id: 'danger',
        label: 'Danger Zone',
        icon: Trash2,
    },
];

export default function AccountSidebar() {
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

            <nav className="relative space-y-2">
                {items.map((item) => {
                    const Icon = item.icon;

                    return (
                        <NavLink
                            key={item.id}
                            to={`/account/${item.id}`}
                            className={({ isActive }) => `
                                relative group flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-colors duration-200
                                ${isActive
                                    ? 'text-marquee-bg z-10'
                                    : 'text-marquee-muted hover:text-marquee-gold hover:bg-marquee-panel2 z-10'
                                }
                            `}
                        >
                            {({ isActive }) => (
                                <>
                                    {/* Sliding background indicator using Framer Motion */}
                                    {isActive && (
                                        <motion.div
                                            layoutId="activeAccountNav"
                                            className="absolute inset-0 rounded-lg bg-marquee-gold shadow-[0_0_20px_rgba(212,175,55,0.25)] -z-10"
                                            transition={{
                                                type: "spring",
                                                stiffness: 380,
                                                damping: 30,
                                            }}
                                        />
                                    )}

                                    <Icon
                                        size={18}
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
            </nav>
        </aside>
    );
}