import { AnimatePresence, motion } from 'framer-motion';
import { AlertCircle, MailCheck, MailWarning, Ticket } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { resendEmailVerification } from '../api/auth';
import { createOrder } from '../api/orders';
import { holdSeat } from '../api/seatHolds';
import { getShowtimeById } from '../api/showtimes';
import SeatMap from '../components/order/SeatMap';
import { useAuth } from '../context/AuthContext';

export default function SeatSelection() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [showtime, setShowtime] = useState(null);
  const [movie, setMovie] = useState(null);
  const [selected, setSelected] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [needsVerification, setNeedsVerification] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [resending, setResending] = useState(false);

  const total = movie ? selected.length * movie.price : 0;

  useEffect(() => { loadShowtime(); }, [id]);

  useEffect(() => {
    const saved = sessionStorage.getItem(`selectedSeats-${id}`);

    if (!saved) return;

    try {
      const parsed = JSON.parse(saved);

      if (parsed.expiresAt && new Date(parsed.expiresAt) > new Date()) {
        setSelected(parsed.seats);
      } else {
        sessionStorage.removeItem(`selectedSeats-${id}`);
      }
    } catch {
      sessionStorage.removeItem(`selectedSeats-${id}`);
    }
  }, [id]);

  useEffect(() => {
    if (!selected.length) return;

    if (!showtime?.holdExpiresAt) return;

    sessionStorage.setItem(
      `selectedSeats-${id}`,
      JSON.stringify({ seats: selected, expiresAt: showtime.holdExpiresAt })
    );
  }, [selected, id, showtime]);

  useEffect(() => {
    const savedBooking = sessionStorage.getItem('pendingBooking');

    if (!savedBooking) return;

    const booking = JSON.parse(savedBooking);

    if (booking.showtimeId === id && Date.now() - booking.createdAt < 15 * 60 * 1000) {
      setSelected(booking.seats);
      sessionStorage.removeItem('pendingBooking');
    }
  }, [id]);

  useEffect(() => {
    if (!showtime?.holdExpiresAt) return;

    const interval = setInterval(() => {
      const remaining = new Date(showtime.holdExpiresAt).getTime() - Date.now();

      if (remaining <= 0) {
        sessionStorage.removeItem(`selectedSeats-${id}`);

        setSelected([]);

        clearInterval(interval);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [showtime, id]);

  async function loadShowtime() {
    setLoading(true);
    setError('');

    try {
      const data = await getShowtimeById(id);

      setShowtime(data.showtime);
      setMovie(data.movie);
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Unable to load showtime.');
    } finally {
      setLoading(false);
    }
  }

  function toggleSeat(seatId) {
    setSelected(prev => prev.includes(seatId) ? prev.filter(s => s !== seatId) : [...prev, seatId]);
  }

  async function handleContinue() {
    if (!user) {
      sessionStorage.setItem('pendingBooking', JSON.stringify({
        showtimeId: id,
        movieId: movie._id,
        seats: selected,
        createdAt: Date.now(),
      }));
      navigate('/login', { state: { from: { pathname: `/showtimes/${id}` } } });
      return;
    }

    if (!selected.length) return;

    setSubmitting(true);
    setError('');
    setNeedsVerification(false);

    try {
      const holdResponse = await holdSeat({ showtimeId: id, seatIds: selected });
      const hold = holdResponse.hold;

      const orderResponse = await createOrder({
        movie: movie._id,
        showtime: id,
        seats: selected,
        ticketAmount: total,
        totalAmount: total,
        holdId: hold.id,
        holdExpiresAt: hold.expiresAt,
      });

      navigate(`/checkout/${orderResponse.order._id}`);
    } catch (err) {
      if (err.response?.data?.code === 'EMAIL_NOT_VERIFIED' || /verify your email/i.test(err.message)) {
        setNeedsVerification(true);
      } else {
        setError(err.response?.data?.error || err.response?.data?.message || err.message || 'Something went wrong');
      }

      await loadShowtime();

      sessionStorage.removeItem(`selectedSeats-${id}`);
      setSelected([]);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleResend() {
    setResending(true);
    try {
      await resendEmailVerification();
      setNeedsVerification('sent');
    } catch (err) {
      setError(err.message);
    } finally {
      setResending(false);
    }
  }

  if (loading) return <p className="py-20 text-center text-marquee-muted">Loading seats...</p>;
  if (!showtime || !movie) return <p className="py-20 text-center text-marquee-muted">Showtime not found.</p>;

  const hasSeats = selected.length > 0;

  return (
    <div className="mx-auto max-w-3xl px-6 py-12">
      <div className="mb-8 text-center">
        <p className="text-xs uppercase tracking-[0.3em] text-marquee-goldDim">
          {new Date(showtime.startTime).toLocaleDateString()}
          {" · "}
          {new Date(showtime.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </p>
        <h1 className="font-serif text-3xl font-bold text-marquee-cream">{movie.title}</h1>
      </div>

      <AnimatePresence initial={false}>
        {error && (
          <motion.div
            key="error"
            initial={{ opacity: 0, y: -12, height: 0, marginBottom: 0 }}
            animate={{ opacity: 1, y: 0, height: 'auto', marginBottom: 24 }}
            exit={{ opacity: 0, y: -8, height: 0, marginBottom: 0 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden"
          >
            <div className="flex items-center justify-center gap-2 rounded-lg border border-marquee-marquee/30 bg-marquee-marquee/10 px-4 py-3 text-center text-sm text-marquee-marquee">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence initial={false}>
        {needsVerification && (
          <motion.div
            key="verify"
            initial={{ opacity: 0, y: -12, height: 0, marginBottom: 0 }}
            animate={{ opacity: 1, y: 0, height: 'auto', marginBottom: 24 }}
            exit={{ opacity: 0, y: -8, height: 0, marginBottom: 0 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden"
          >
            <div className="rounded-lg border border-marquee-gold/30 bg-marquee-gold/10 px-4 py-4 text-center text-sm text-marquee-cream">
              {needsVerification === 'sent' ? (
                <p className="flex items-center justify-center gap-2">
                  <MailCheck className="h-4 w-4 text-marquee-gold" />
                  A new verification link is on its way.
                </p>
              ) : (
                <>
                  <p className="mb-3 flex items-center justify-center gap-2">
                    <MailWarning className="h-4 w-4 text-marquee-gold" />
                    Please verify your email before booking tickets.
                  </p>
                  <button
                    onClick={handleResend}
                    disabled={resending}
                    className="rounded-full border border-marquee-gold px-4 py-1.5 text-marquee-gold transition-colors hover:bg-marquee-gold hover:text-marquee-bg disabled:opacity-50"
                  >
                    {resending ? 'Sending...' : 'Resend verification email'}
                  </button>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="rounded-xl border border-marquee-line bg-marquee-panel p-8">
        <SeatMap seats={showtime.seats} selected={selected} onToggle={toggleSeat} />
      </div>

      <motion.div
        animate={{
          borderColor: hasSeats ? 'rgba(198,161,91,0.45)' : 'rgb(255 255 255 / 0.08)',
          boxShadow: hasSeats
            ? '0 8px 30px -12px rgba(198,161,91,0.25), 0 0 0 1px rgba(198,161,91,0.1)'
            : '0 0 0 0 rgba(0,0,0,0)',
          y: hasSeats ? -2 : 0,
        }}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        className="ticket-edge mt-8 flex items-center justify-between rounded-lg border border-dashed border-marquee-line bg-marquee-panel2 px-8 py-5"
      >
        <div className="min-w-0">
          <p className="text-xs uppercase tracking-widest text-marquee-muted">
            {selected.length} seat{selected.length === 1 ? '' : 's'} selected
          </p>

          <div className="mt-2 flex flex-wrap items-center gap-1.5 min-h-[22px]">
            <AnimatePresence mode="popLayout" initial={false}>
              {selected.length === 0 ? (
                <motion.span
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="font-mono text-sm text-marquee-muted"
                >
                  —
                </motion.span>
              ) : (
                selected.map(seat => (
                  <motion.span
                    key={seat}
                    layout
                    initial={{ opacity: 0, scale: 0.5, y: 6 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.5, y: -6 }}
                    transition={{ type: 'spring', stiffness: 500, damping: 28 }}
                    className="inline-flex items-center rounded-md border border-marquee-gold/40 bg-marquee-gold/10 px-1.5 py-0.5 font-mono text-[11px] text-marquee-gold"
                  >
                    {seat}
                  </motion.span>
                ))
              )}
            </AnimatePresence>
          </div>
        </div>

        <div className="text-right shrink-0">
          <motion.p
            key={total}
            initial={{ opacity: 0, y: 8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ type: 'spring', stiffness: 500, damping: 25 }}
            className="font-display text-3xl tracking-wide text-marquee-gold"
          >
            ${total.toFixed(2)}
          </motion.p>

          <motion.button
            onClick={handleContinue}
            disabled={!hasSeats || submitting}
            whileHover={hasSeats && !submitting ? { scale: 1.03 } : undefined}
            whileTap={hasSeats && !submitting ? { scale: 0.97 } : undefined}
            animate={{
              backgroundColor: hasSeats ? '#c6a15b' : 'rgba(198,161,91,0.35)',
            }}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            className="group relative mt-2 inline-flex items-center justify-center gap-2 overflow-hidden rounded-full px-6 py-2 font-semibold text-marquee-bg disabled:cursor-not-allowed"
          >
            <span className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/40 to-transparent transition-transform duration-700 group-hover:translate-x-full" />

            <AnimatePresence mode="wait" initial={false}>
              {submitting ? (
                <motion.span
                  key="loading"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.15 }}
                  className="inline-flex items-center gap-2"
                >
                  <motion.span
                    animate={{ rotate: 360 }}
                    transition={{ duration: 0.9, repeat: Infinity, ease: 'linear' }}
                    className="inline-block h-3.5 w-3.5 rounded-full border-2 border-marquee-bg/40 border-t-marquee-bg"
                  />
                  Reserving
                </motion.span>
              ) : (
                <motion.span
                  key="idle"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.15 }}
                  className="inline-flex items-center gap-2"
                >
                  <Ticket size={15} />
                  Continue to payment
                </motion.span>
              )}
            </AnimatePresence>
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
}