import { useEffect, useState } from 'react';
import api from '../api/client';

import TicketCard from '../components/tickets/TicketCard';
import EmptyTickets from '../components/tickets/EmptyTickets';
import TicketSidebar from '../components/tickets/TicketSidebar';

export default function MyTickets() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [active, setActive] = useState('all');


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
    <div className="mx-auto flex max-w-6xl items-start gap-8 px-6 py-12">
      <TicketSidebar
        active={active}
        setActive={setActive}
      />


      <main className="flex-1 rounded-xl border border-marquee-line bg-marquee-panel p-8">

        <div className="mb-8 border-b border-marquee-line pb-6">

          <h1 className="font-display text-3xl text-marquee-goldBright">
            {active === 'all' && 'All Tickets'}
            {active === 'upcoming' && 'Upcoming Movies'}
            {active === 'past' && 'Past Movies'}
            {active === 'cancelled' && 'Cancelled Tickets'}
          </h1>

          <p className="mt-2 text-sm text-marquee-muted">
            Your GoldCinema bookings
          </p>

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