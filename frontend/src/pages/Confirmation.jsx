import {
  ArrowRight,
  CalendarDays,
  Clock3,
  TicketCheck,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';

import { getOrderById } from '../api/orders';
import ConfirmationHeader from '../components/confirmation/ConfirmationHeader';
import QRTicket from '../components/confirmation/QRTicket';
import TicketDetails from '../components/confirmation/TicketDetails';
import UnpaidOrder from '../components/confirmation/UnpaidOrder';

export default function Confirmation() {
  const { orderId } = useParams();

  const [order, setOrder] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;

    async function fetchOrder() {
      try {
        const data = await getOrderById(orderId);

        if (!cancelled) {
          setOrder(data.order);
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err.response?.data?.error ||
            err.message ||
            'Something went wrong'
          );
        }
      }
    }

    fetchOrder();

    return () => {
      cancelled = true;
    };
  }, [orderId]);

  if (error) {
    return (
      <main className="mx-auto flex min-h-[80vh] max-w-lg flex-col items-center justify-center px-4 py-10 text-center sm:px-6 sm:py-14">
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full border border-marquee-line bg-marquee-panel">
          <TicketCheck
            size={21}
            className="text-marquee-goldDim"
          />
        </div>

        <h1 className="text-lg font-semibold text-marquee-cream">
          Unable to load your ticket
        </h1>

        <p className="mt-2 text-sm leading-6 text-marquee-muted">
          {error}
        </p>

        <Link
          to="/account/tickets"
          className="mt-6 inline-flex items-center gap-2 text-sm text-marquee-gold transition-colors hover:text-marquee-goldBright"
        >
          View my tickets
          <ArrowRight size={15} />
        </Link>
      </main>
    );
  }

  if (!order) {
    return (
      <main className="mx-auto flex min-h-[100vh] max-w-lg flex-col items-center justify-center px-6">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-marquee-line border-t-marquee-gold" />

        <p className="mt-4 text-sm text-marquee-muted">
          Loading your ticket...
        </p>
      </main>
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
    <main className="mx-auto max-w-xl px-4 py-10 sm:px-6 sm:py-14">
      <ConfirmationHeader />

      <section className="ticket-edge relative mt-8 overflow-hidden rounded-2xl border border-marquee-line bg-marquee-panel shadow-xl shadow-black/10">
        {/* Left ticket punch */}
        <span
          aria-hidden="true"
          className="absolute left-0 top-1/2 z-20 h-7 w-7 -translate-x-1/2 -translate-y-1/2 rounded-full bg-marquee-bg"
        />

        {/* Right ticket punch */}
        <span
          aria-hidden="true"
          className="absolute right-0 top-1/2 z-20 h-7 w-7 translate-x-1/2 -translate-y-1/2 rounded-full bg-marquee-bg"
        />

        {/* Ticket heading */}
        <div className="border-b border-dashed border-marquee-line/80 p-5 sm:p-6">
          <div className="flex items-start gap-4">
            {movie?.posterUrl ? (
              <img
                src={movie.posterUrl}
                alt={movie?.title || 'Movie poster'}
                className="h-32 w-[5.5rem] shrink-0 rounded-lg object-cover shadow-md sm:h-36 sm:w-24"
              />
            ) : (
              <div className="flex h-32 w-[5.5rem] shrink-0 items-center justify-center rounded-lg bg-marquee-panel2 sm:h-36 sm:w-24">
                <TicketCheck
                  size={24}
                  className="text-marquee-goldDim"
                />
              </div>
            )}

            <div className="min-w-0 flex-1 py-1">
              <div className="mb-3 flex items-center gap-2">
                <TicketCheck
                  size={15}
                  className="shrink-0 text-marquee-gold"
                />

                <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-marquee-goldDim">
                  GoldCinema E-Ticket
                </span>
              </div>

              <h1 className="text-xl font-semibold leading-snug tracking-tight text-marquee-cream">
                {movie?.title || 'Your movie ticket'}
              </h1>

              {startTime && (
                <div className="mt-3 space-y-2">
                  <p className="flex items-center gap-2 text-sm text-marquee-muted">
                    <CalendarDays
                      size={15}
                      className="shrink-0"
                    />

                    {startTime.toLocaleDateString(undefined, {
                      weekday: 'short',
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </p>

                  <p className="flex items-center gap-2 text-sm text-marquee-muted">
                    <Clock3
                      size={15}
                      className="shrink-0"
                    />

                    {startTime.toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Booking information */}
        <TicketDetails order={order} />

        {/* Entry QR code */}
        <div className="border-t border-dashed border-marquee-line">
          <QRTicket qrTicket={order.qrTicket} />
        </div>

        {/* Ticket footer */}
        <div className="flex items-center justify-between gap-3 border-t border-marquee-line bg-marquee-panel2/50 px-5 py-4 sm:px-6">
          <span className="text-xs text-marquee-muted">
            Keep your ticket ready for entry
          </span>

          <Link
            to="/account/tickets"
            className="inline-flex shrink-0 items-center gap-1.5 text-xs font-medium text-marquee-gold transition-colors hover:text-marquee-goldBright"
          >
            My tickets
            <ArrowRight size={14} />
          </Link>
        </div>
      </section>
    </main>
  );
}