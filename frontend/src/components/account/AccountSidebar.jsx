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

const items = [
    {
        id: 'profile',
        label: 'Profile',
        icon: User,
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

const renderItem = (item) => {
    const Icon = item.icon;

    return (
        <NavLink
            key={item.id}
            to={`/account/${item.id}`}
            className={({ isActive }) => `
                group flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-all
                ${isActive
                    ? `
                            bg-marquee-gold
                            text-marquee-bg
                            shadow-[0_0_20px_rgba(212,175,55,0.25)]
                        `
                    : `
                            text-marquee-muted
                            hover:bg-marquee-panel2
                            hover:text-marquee-gold
                        `
                }
            `}
        >
            {({ isActive }) => (
                <>
                    <Icon
                        size={18}
                        className={
                            isActive
                                ? 'text-marquee-bg'
                                : 'text-marquee-muted group-hover:text-marquee-gold'
                        }
                    />

                    <span>
                        {item.label}
                    </span>

                    {isActive && (
                        <span className="ml-auto h-1.5 w-1.5 rounded-full bg-marquee-bg" />
                    )}
                </>
            )}
        </NavLink>
    );
};

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

            <nav className="space-y-2">
                {items.map((item) => {
                    const Icon = item.icon;

                    return (
                        <NavLink
                            key={item.id}
                            to={`/account/${item.id}`}
                            className={({ isActive }) => `
                group flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-all
                ${isActive
                                    ? `
                            bg-marquee-gold
                            text-marquee-bg
                            shadow-[0_0_20px_rgba(212,175,55,0.25)]
                        `
                                    : `
                            text-marquee-muted
                            hover:bg-marquee-panel2
                            hover:text-marquee-gold
                        `
                                }
            `}
                        >
                            {({ isActive }) => (
                                <>
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