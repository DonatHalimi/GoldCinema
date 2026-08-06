import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';

import api from '../api/client';

import ConfirmationHeader from '../components/confirmation/ConfirmationHeader';
import TicketDetails from '../components/confirmation/TicketDetails';
import QRTicket from '../components/confirmation/QRTicket';
import UnpaidOrder from '../components/confirmation/UnpaidOrder';

export default function Confirmation() {
  const { orderId } = useParams();

  const [order, setOrder] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchOrder() {
      try {
        const { data } = await api.get(`/orders/${orderId}`);
        setOrder(data.order);
      } catch (err) {
        console.error(err);

        setError(
          err.response?.data?.error ||
          err.message ||
          'Something went wrong'
        );
      }
    }

    fetchOrder();
  }, [orderId]);

  if (error) {
    return (
      <p className="py-20 text-center text-marquee-marquee">
        {error}
      </p>
    );
  }

  if (!order) {
    return (
      <p className="py-20 text-center text-marquee-muted">
        Loading...
      </p>
    );
  }

  if (order.paymentStatus !== 'paid') {
    return <UnpaidOrder orderId={order._id} />;
  }

  const movie = order.movie;

  const startTime = order.showtime?.startTime
    ? new Date(order.showtime.startTime)
    : null;

  return (
    <div className="mx-auto max-w-lg px-6 py-16">
      <ConfirmationHeader />

      <div className="ticket-edge overflow-hidden rounded-xl border border-marquee-line bg-marquee-panel shadow-glow">

        <div className="flex gap-4 p-6">
          <img
            src={movie?.posterUrl}
            alt={movie?.title}
            className="h-28 w-20 flex-shrink-0 rounded object-cover"
          />

          <div>
            <p className="text-xs uppercase tracking-widest text-marquee-goldDim">
              GoldCinema E-Ticket
            </p>

            <h1 className="font-serif text-xl font-bold text-marquee-cream">
              {movie?.title}
            </h1>

            {startTime && (
              <p className="mt-1 text-sm text-marquee-muted">
                {startTime.toLocaleDateString()} ·{' '}
                {startTime.toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
            )}
          </div>
        </div>

        <TicketDetails order={order} />

        <QRTicket qrTicket={order.qrTicket} />

      </div>

      <div className="mt-8 text-center">
        <Link
          to="/tickets"
          className="text-sm text-marquee-gold hover:text-marquee-goldBright"
        >
          View all my tickets →
        </Link>
      </div>
    </div>
  );
}