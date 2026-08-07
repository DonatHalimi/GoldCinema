import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import api from "../../api/client";
import EmptyTickets from '../../components/tickets/EmptyTickets';
import TicketCard from "../../components/tickets/TicketCard";

export default function TicketContent() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [active, setActive] = useState('all');
    const [error, setError] = useState('');

    useEffect(() => {
        async function loadTickets() {
            try {
                const { data } = await api.get('/orders/mine');
                setOrders(data.orders || []);
            } catch (err) {
                console.error('ORDERS LOAD ERROR:', err);
                setError(
                    err.response?.data?.error ||
                    err.message ||
                    'Failed to load tickets'
                );
            } finally {
                setLoading(false);
            }
        }

        loadTickets();
    }, []);

    const filteredOrders = orders.filter((order) => {
        if (active === 'all') {
            return true;
        }

        const showtime = order.showtime?.startTime
            ? new Date(order.showtime.startTime)
            : null;

        if (active === 'upcoming') {
            return showtime && showtime > new Date();
        }

        if (active === 'past') {
            return showtime && showtime < new Date();
        }

        if (active === 'cancelled') {
            return order.status === 'cancelled';
        }

        return true;
    });

    const filters = [
        { label: 'All', value: 'all' },
        { label: 'Upcoming', value: 'upcoming' },
        { label: 'Past', value: 'past' },
        { label: 'Cancelled', value: 'cancelled' },
    ];

    return (
        <div>
            <main className="flex-1 rounded-xl bg-marquee-panel">
                <div className="mb-8 flex flex-col gap-4 border-b border-marquee-line pb-6 md:flex-row md:items-center md:justify-between">
                    <h2 className="whitespace-nowrap font-display text-2xl font-semibold tracking-wide text-marquee-goldBright">
                        {active === 'all' && 'All Tickets'}
                        {active === 'upcoming' && 'Upcoming Movies'}
                        {active === 'past' && 'Past Movies'}
                        {active === 'cancelled' && 'Cancelled Tickets'}
                    </h2>

                    {/* Filter Container */}
                    <div className="inline-flex items-center gap-1.5 rounded-full border border-marquee-line bg-marquee-bg p-1.5">
                        {filters.map((filter) => {
                            const isActive = active === filter.value;
                            return (
                                <button
                                    key={filter.value}
                                    onClick={() => setActive(filter.value)}
                                    className={`relative rounded-full px-5 py-2 text-sm font-medium transition-colors duration-200 ${isActive
                                        ? 'text-white'
                                        : 'text-marquee-muted hover:text-marquee-gold'
                                        }`}
                                >
                                    {isActive && (
                                        <motion.div
                                            layoutId="activeFilterPill"
                                            transition={{
                                                type: "spring",
                                                stiffness: 380,
                                                damping: 30,
                                            }}
                                            className="absolute inset-0 rounded-full bg-marquee-gold shadow-md"
                                        />
                                    )}

                                    {/* Button Text */}
                                    <span className="relative z-10">{filter.label}</span>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {loading && (
                    <p className="text-marquee-muted">
                        Loading your tickets...
                    </p>
                )}

                {error && (
                    <p className="text-red-400">
                        {error}
                    </p>
                )}

                {!loading && filteredOrders.length === 0 && (
                    <EmptyTickets />
                )}

                <div
                    key={active}
                    className="animate-filter"
                >
                    {filteredOrders.map((ticket) => (
                        <TicketCard
                            key={ticket._id}
                            order={ticket}
                        />
                    ))}
                </div>
            </main>
        </div>
    );
}