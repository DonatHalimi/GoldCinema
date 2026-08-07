import { Link } from 'react-router-dom';
import TicketStatus from './TicketStatus';

export default function TicketCard({ order }) {
  const checkoutPath =
    order.paymentStatus === 'paid'
      ? `/confirmation/${order._id}`
      : `/checkout/${order._id}`;

  if (!order) return null;

  const formattedDate = order.showtime?.startTime
    ? new Date(order.showtime.startTime).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    })
    : 'Date TBD';

  return (
    <Link
      to={checkoutPath}
      className="group relative flex w-full items-stretch overflow-hidden rounded-xl border border-marquee-line bg-marquee-panel shadow-lg transition-transform duration-200 hover:-translate-y-1 hover:border-marquee-gold"
    >
      {/* --- LEFT SECTION: Movie Info --- */}
      <div className="relative flex flex-1 items-center gap-4 p-4">
        {order.movie?.posterUrl ? (
          <img
            src={order.movie.posterUrl}
            alt={order.movie.title}
            className="h-20 w-14 rounded object-cover shadow-md"
            loading="lazy"
          />
        ) : (
          <div className="flex h-20 w-14 items-center justify-center rounded bg-marquee-line/50 text-xs text-marquee-muted">
            No Image
          </div>
        )}

        <div className="flex-1 min-w-0">
          <p className="font-serif text-base font-bold text-marquee-cream truncate">
            {order.movie?.title || 'Untitled Movie'}
          </p>

          <p className="mt-1 text-xs text-marquee-muted">
            {formattedDate}
            {order.seats?.length > 0 && (
              <>
                <span className="mx-1.5 opacity-40">·</span>
                <span>Seat{order.seats.length > 1 ? 's' : ''}: {order.seats.join(', ')}</span>
              </>
            )}
          </p>
        </div>

        {/* --- PERFORATED TEAR LINE --- */}
        {/* Creates a subtle vertical dotted divider before the price stub */}
        <div className="absolute right-0 top-3 bottom-3 border-r border-dashed border-marquee-line opacity-40" />
      </div>

      {/* --- RIGHT SECTION: Price & Status Stub (Tear-off) --- */}
      <div className="relative flex w-28 flex-col items-center justify-center bg-black/20 p-4 text-center border-l border-dashed border-marquee-line/50">
        {/* Ticket punch-out notches (Semi-circles on top and bottom edges) */}
        <div className="absolute -top-3 -left-3 h-6 w-6 rounded-full bg-marquee-panel border border-marquee-line" />
        <div className="absolute -bottom-3 -left-3 h-6 w-6 rounded-full bg-marquee-panel border border-marquee-line" />

        <p className="font-display text-lg font-bold text-marquee-gold">
          ${order.totalAmount?.toFixed(2) || '0.00'}
        </p>

        <div className="mt-1">
          <TicketStatus status={order.paymentStatus} />
        </div>

        <span className="mt-2 text-[9px] uppercase tracking-widest text-marquee-muted opacity-50">
          Admit One
        </span>
      </div>
    </Link>
  );
}