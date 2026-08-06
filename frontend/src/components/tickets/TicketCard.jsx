import { Link } from 'react-router-dom';
import TicketStatus from './TicketStatus';

export default function TicketCard({ order }) {
  const checkoutPath =
    order.paymentStatus === 'paid'
      ? `/confirmation/${order._id}`
      : `/checkout/${order._id}`;

  return (
    <Link
      to={checkoutPath}
      className="flex items-center gap-4 rounded-lg border border-marquee-line bg-marquee-panel p-4 transition hover:border-marquee-gold"
    >
      {order.movie?.posterUrl && (
        <img
          src={order.movie.posterUrl}
          alt={order.movie.title}
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
            )}

          {' · '}

          Seats {order.seats?.join(', ')}
        </p>
      </div>

      <div className="text-right">
        <p className="font-display text-lg text-marquee-gold">
          ${order.totalAmount?.toFixed(2)}
        </p>

        <TicketStatus status={order.paymentStatus} />
      </div>
    </Link>
  );
}