import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import api from '../api/client';

export default function Confirmation() {
  const { orderId } = useParams();

  const [order, setOrder] = useState(null);
  const [movie, setMovie] = useState(null);
  const [showtime, setShowtime] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api
      .get(`/orders/${orderId}`)
      .then(({ data }) => {
        setOrder(data.order);
        setMovie(data.order.movie);
        setShowtime(data.order.showtime);
      })
      .catch((err) => {
        console.error(err);
        setError(
          err.response?.data?.error ||
          err.message ||
          'Something went wrong'
        );
      });
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
    return (
      <div className="mx-auto max-w-lg px-6 py-20 text-center">
        <p className="text-marquee-cream">
          This order has not been paid yet.
        </p>

        <Link
          to={`/checkout/${order._id}`}
          className="mt-4 inline-block rounded-full bg-marquee-gold px-6 py-2 font-semibold text-marquee-bg"
        >
          Go to checkout
        </Link>
      </div>
    );
  }

  const startTime = showtime?.startTime
    ? new Date(showtime.startTime)
    : null;

  return (
    <div className="mx-auto max-w-lg px-6 py-16">
      <div className="mb-6 text-center">
        <p className="font-display text-4xl tracking-wide text-marquee-goldBright">
          YOU'RE ALL SET 🎉
        </p>

        <p className="mt-2 text-marquee-muted">
          Your tickets have been booked. Enjoy the show!
        </p>
      </div>

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

        <div className="border-t border-dashed border-marquee-line px-6 py-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-marquee-muted">
              Seats
            </span>

            <span className="font-mono text-marquee-cream">
              {order.seats.join(', ')}
            </span>
          </div>

          <div className="mt-2 flex items-center justify-between text-sm">
            <span className="text-marquee-muted">
              Paid via
            </span>

            <span className="capitalize text-marquee-cream">
              {order.paymentProvider}
            </span>
          </div>

          <div className="mt-2 flex items-center justify-between text-sm">
            <span className="text-marquee-muted">
              Total
            </span>

            <span className="font-display text-xl text-marquee-gold">
              ${order.totalAmount.toFixed(2)}
            </span>
          </div>

          <div className="mt-2 flex items-center justify-between text-xs text-marquee-muted">
            <span>
              Confirmation
            </span>

            <span className="font-mono">
              {order._id.slice(0, 8).toUpperCase()}
            </span>
          </div>
        </div>

        <div className="border-t border-dashed border-marquee-line px-6 py-6 text-center">
          {order.qrTicket?.dataUrl ? (
            <>
              <p className="mb-4 text-xs uppercase tracking-widest text-marquee-goldDim">
                Entry QR Ticket
              </p>

              <img
                src={order.qrTicket.dataUrl}
                alt="QR Ticket"
                className="mx-auto h-48 w-48 rounded-lg bg-white p-3"
              />

              <p className="mt-4 text-xs text-marquee-muted">
                Scan this QR code at the cinema entrance
              </p>
            </>
          ) : (
            <p className="text-sm text-marquee-muted">
              QR ticket is being generated...
            </p>
          )}
        </div>
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