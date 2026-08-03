import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/client';

const STATUS_STYLES = {
  paid: 'text-marquee-gold border-marquee-gold/40',
  pending: 'text-marquee-muted border-marquee-line',
  failed: 'text-marquee-marquee border-marquee-marquee/40',
  refunded: 'text-marquee-muted/60 border-marquee-line/60',
};

export default function MyTickets() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api
      .get('/orders/mine')
      .then(({ data }) => {
        setOrders(data.orders || []);
      })
      .catch((err) => {
        console.error('ORDERS LOAD ERROR:', err);

        setError(
          err.response?.data?.error ||
          err.message ||
          'Failed to load tickets'
        );
      })
      .finally(() => {
        setLoading(false);
      });
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
        <div className="rounded-xl border border-dashed border-marquee-line p-10 text-center">
          <p className="text-marquee-muted">
            You haven't booked any tickets yet.
          </p>

          <Link
            to="/"
            className="mt-4 inline-block rounded-full bg-marquee-gold px-6 py-2 font-semibold text-marquee-bg"
          >
            Browse movies
          </Link>
        </div>
      )}

      <div className="space-y-4">
        {orders.map((order) => (
          <Link
            key={order._id}
            to={
              order.paymentStatus === 'paid'
                ? `/confirmation/${order._id}`
                : `/checkout/${order._id}`
            }
            className="flex items-center gap-4 rounded-lg border border-marquee-line bg-marquee-panel p-4 transition hover:border-marquee-gold"
          >
            {order.movie?.posterUrl && (
              <img
                src={order.movie.posterUrl}
                alt=""
                className="h-16 w-12 rounded object-cover"
              />
            )}

            <div className="flex-1">
              <p className="font-serif font-semibold text-marquee-cream">
                {order.movie?.title}
              </p>

              <p className="text-sm text-marquee-muted">
                {order.showtime?.startTime &&
                  new Date(order.showtime.startTime).toLocaleString(
                    'en-US',
                    {
                      dateStyle: 'medium',
                      timeStyle: 'short',
                    }
                  )
                }
                {' · '}
                Seats {order.seats?.join(', ')}
              </p>
            </div>

            <div className="text-right">
              <p className="font-display text-lg text-marquee-gold">
                ${order.totalAmount?.toFixed(2)}
              </p>

              <span className={`inline-block rounded-full border px-2 py-0.5 text-xs uppercase tracking-wide ${STATUS_STYLES[order.paymentStatus] || ''}`}>
                {order.paymentStatus}
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}