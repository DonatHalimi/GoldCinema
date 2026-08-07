import { useEffect, useState } from "react";
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

    return (
        <div>
            <main className="flex-1 rounded-xl bg-marquee-panel">
                <div className="mb-8 flex items-start justify-between border-b border-marquee-line pb-6">
                    <div>
                        <h2 className="font-display text-2xl font-semibold tracking-wide text-marquee-goldBright">
                            {active === 'all' && 'All Tickets'}
                            {active === 'upcoming' && 'Upcoming Movies'}
                            {active === 'past' && 'Past Movies'}
                            {active === 'cancelled' && 'Cancelled Tickets'}
                        </h2>

                        <p className="mt-2 text-sm text-marquee-muted">
                            Your GoldCinema bookings
                        </p>
                    </div>

                    <div className="flex items-center gap-2 rounded-full border border-marquee-line bg-marquee-bg p-1">
                        {[
                            { label: 'All', value: 'all' },
                            { label: 'Upcoming', value: 'upcoming' },
                            { label: 'Past', value: 'past' },
                            { label: 'Cancelled', value: 'cancelled' },
                        ].map((filter) => (
                            <button
                                key={filter.value}
                                onClick={() => setActive(filter.value)}
                                className={`rounded-full px-4 py-2 text-sm transition${active === filter.value
                                    ? 'bg-marquee-gold text-white font-semibold'
                                    : 'text-marquee-muted hover:text-marquee-gold'
                                    }
                `}
                            >
                                {filter.label}
                            </button>
                        ))}
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

                <div className="space-y-4">
                    {filteredOrders.map((order) => (
                        <TicketCard
                            key={order._id}
                            order={order}
                        />
                    ))}
                </div>
            </main>
        </div>
    );
}