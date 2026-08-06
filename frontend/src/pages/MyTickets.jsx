import { useEffect, useState } from 'react';
import api from '../api/client';

import TicketCard from '../components/tickets/TicketCard';
import EmptyTickets from '../components/tickets/EmptyTickets';

export default function MyTickets() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
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

  return (
    <div className="mx-auto max-w-3xl px-6 py-12">
      <h1 className="mb-8 font-serif text-3xl font-bold text-marquee-cream">
        My Tickets
      </h1>

      {loading && (
        <p className="text-marquee-muted">
          Loading your tickets...
        </p>
      )}

      {error && (
        <p className="text-marquee-marquee">
          {error}
        </p>
      )}

      {!loading && orders.length === 0 && (
        <EmptyTickets />
      )}

      <div className="space-y-4">
        {orders.map((order) => (
          <TicketCard
            key={order._id}
            order={order}
          />
        ))}
      </div>
    </div>
  );
}