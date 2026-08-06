import {
    Ticket,
    Clock,
    History,
    XCircle,
} from 'lucide-react';

const items = [
    {
        id: 'all',
        label: 'All Tickets',
        icon: Ticket,
    },
    {
        id: 'upcoming',
        label: 'Upcoming',
        icon: Clock,
    },
    {
        id: 'past',
        label: 'Past Movies',
        icon: History,
    },
    {
        id: 'cancelled',
        label: 'Cancelled',
        icon: XCircle,
    },
];

export default function TicketSidebar({
    active,
    setActive,
}) {
    return (
        <aside className="sticky top-24 w-64 rounded-xl border border-marquee-line bg-marquee-panel p-4">
            <div className="mb-6 px-3">
                <h2 className="font-display text-xl text-marquee-goldBright">
                    My Tickets
                </h2>

                <p className="mt-1 text-xs text-marquee-muted">
                    Manage your bookings
                </p>
            </div>


            <nav className="space-y-2">
                {items.map((item) => {
                    const Icon = item.icon;
                    const isActive = active === item.id;

                    return (
                        <button
                            key={item.id}
                            onClick={() => setActive(item.id)}
                            className={`
                group flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-all
                ${isActive
                                    ? `
                      bg-marquee-gold
                      text-marquee-bg
                      shadow-[0_0_20px_rgba(212,175,55,0.25)]
                    `
                                    :
                                    `
                      text-marquee-muted
                      hover:bg-marquee-panel2
                      hover:text-marquee-gold
                    `
                                }
              `}
                        >
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
                        </button>
                    );
                })}
            </nav>

        </aside>
    );
}