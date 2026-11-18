import { Film, MapPin, Clock, Ticket as TicketIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import TicketStatus from './TicketStatus';

export default function TicketCard({ order }) {
  const { t } = useTranslation('account');

  if (!order) return null;

  const checkoutPath = order.paymentStatus === 'paid'
    ? `/confirmation/${order._id}`
    : `/checkout/${order._id}`;

  const formattedDate = order.showtime?.startTime
    ? new Date(order.showtime.startTime).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    })
    : 'Date TBD';

  return (
    <Link to={checkoutPath} className="group block overflow-hidden rounded-xl border border-marquee-line bg-marquee-bg transition-all duration-200 hover:border-marquee-gold/60 hover:shadow-lg hover:shadow-marquee-gold/5">
      <div className="flex flex-col sm:flex-row">
        <div className="flex flex-1 items-start gap-4 p-5 sm:p-6">
          <div className="shrink-0">
            {order.movie?.posterUrl ? (
              <img
                src={order.movie.posterUrl}
                alt={order.movie.title}
                loading="lazy"
                className="h-24 w-16 rounded-lg border border-marquee-line object-cover shadow-md"
              />
            ) : (
              <div className="flex h-24 w-16 items-center justify-center rounded-lg border border-marquee-line bg-marquee-panel2 text-marquee-muted">
                <Film size={18} />
              </div>
            )}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <h3 className="truncate font-semibold text-marquee-cream">
                  {order.movie?.title || 'Untitled Movie'}
                </h3>

                <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-marquee-muted">
                  <span className="inline-flex items-center gap-1">
                    <Clock size={12} />
                    {formattedDate}
                  </span>

                  {order.showtime?.auditorium && (
                    <span className="inline-flex items-center gap-1">
                      <MapPin size={12} />
                      {order.showtime.auditorium}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {order.seats?.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-1.5">
                {order.seats.map((seat) => (
                  <span key={seat} className="rounded-md border border-marquee-line/70 bg-marquee-panel2 px-2 py-0.5 text-[11px] font-medium text-marquee-muted">
                    {seat}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="relative flex shrink-0 flex-row items-center justify-between gap-3 border-t border-dashed border-marquee-line/70 px-5 py-4 sm:w-32 sm:flex-col sm:justify-center sm:border-l sm:border-t-0 sm:px-4 sm:py-6">
          <span className="absolute -left-2.5 -top-2.5 hidden h-5 w-5 rounded-full border border-marquee-line bg-marquee-bg sm:block" />
          <span className="absolute -left-2.5 -bottom-2.5 hidden h-5 w-5 rounded-full border border-marquee-line bg-marquee-bg sm:block" />

          <div className="sm:text-center">
            <p className="font-display text-lg font-bold tracking-wide text-marquee-gold">
              ${order.totalAmount?.toFixed(2) || '0.00'}
            </p>
            <div className="mt-1.5">
              <TicketStatus status={order.paymentStatus} />
            </div>
          </div>

          <div className="flex items-center gap-1.5 text-[9px] uppercase tracking-widest text-marquee-muted opacity-70 sm:mt-2">
            {t('admitOne')}
          </div>
        </div>
      </div>
    </Link>
  );
}