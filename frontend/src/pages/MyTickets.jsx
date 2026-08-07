import { useEffect, useState } from 'react';
import api from '../api/client';

import TicketCard from '../components/tickets/TicketCard';
import EmptyTickets from '../components/tickets/EmptyTickets';
import TicketSidebar from '../components/tickets/TicketSidebar';
import TicketContent from '../components/account/TicketContent';

export default function MyTickets() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [active, setActive] = useState('all');

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

      <TicketContent
        orders={filteredOrders}
        loading={loading}
        error={error}
      />
    </div>
  );
}