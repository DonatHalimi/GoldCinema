import { AnimatePresence, motion } from 'framer-motion';
import { AlertCircle, MailCheck, MailWarning, Ticket } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { resendEmailVerification } from '../api/auth';
import SeatMap from '../components/order/SeatMap';
import { useAuth } from '../context/AuthContext';
import { useCreateOrderMutation, useHoldSeatsMutation } from '../store/api/bookingsApiSlice';
import { useGetShowtimeQuery } from '../store/api/moviesApiSlice';
import {
  clearBookingSelection,
  restoreSelectedSeats,
  setBookingContext,
  setBookingHold,
  setBookingStatus,
  toggleSelectedSeat,
} from '../store/slices/bookingSlice';
import { selectSelectedSeatTotal, selectSelectedSeats } from '../store/selectors/bookingSelectors';

export default function SeatSelection() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const dispatch = useDispatch();
  const { data: showtimeData, isLoading: loading, error: showtimeError, refetch: refetchShowtime } = useGetShowtimeQuery(id);
  const [holdSeats] = useHoldSeatsMutation();
  const [createOrder] = useCreateOrderMutation();
  const selected = useSelector(selectSelectedSeats);
  const total = useSelector(selectSelectedSeatTotal);
  const holdExpiresAt = useSelector((state) => state.booking.holdExpiresAt);
  const holdId = useSelector((state) => state.booking.holdId);
  const showtime = showtimeData?.showtime || null;
  const movie = showtimeData?.movie || null;

  const [actionError, setActionError] = useState('');
  const [needsVerification, setNeedsVerification] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [resending, setResending] = useState(false);

  useEffect(() => {
    if (!showtime || !movie) return;
    dispatch(setBookingContext({
      cinemaId: showtime.cinemaId,
      screenId: showtime.screenId,
      movieId: movie._id,
      showtimeId: id,
      ticketPrice: movie.price,
    }));

    const saved = sessionStorage.getItem(`selectedSeats-${id}`);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.holdId && parsed.expiresAt && new Date(parsed.expiresAt) > new Date()) {
          const restored = parsed.seats.map((seatId) => ({
            id: seatId,
            type: showtime.seats.find((seat) => seat.id === seatId)?.type || 'standard',
          }));
          dispatch(restoreSelectedSeats(restored));
          dispatch(setBookingHold({ id: parsed.holdId, expiresAt: parsed.expiresAt }));
        } else {
          sessionStorage.removeItem(`selectedSeats-${id}`);
        }
      } catch {
        sessionStorage.removeItem(`selectedSeats-${id}`);
      }
    }

    const savedBooking = sessionStorage.getItem('pendingBooking');
    if (!savedBooking) return;
    try {
      const booking = JSON.parse(savedBooking);
      if (booking.showtimeId === id && Date.now() - booking.createdAt < 15 * 60 * 1000) {
        dispatch(restoreSelectedSeats(booking.seats));
        sessionStorage.removeItem('pendingBooking');
      }
    } catch {
      sessionStorage.removeItem('pendingBooking');
    }
  }, [dispatch, id, movie, showtime]);

  useEffect(() => {
    if (!holdExpiresAt || !selected.length) return;
    sessionStorage.setItem(
      `selectedSeats-${id}`,
      JSON.stringify({ seats: selected, expiresAt: holdExpiresAt })
    );
  }, [holdExpiresAt, holdId, id, selected]);

  useEffect(() => {
    if (!holdExpiresAt) return undefined;
    const interval = setInterval(() => {
      if (new Date(holdExpiresAt).getTime() <= Date.now()) {
        sessionStorage.removeItem(`selectedSeats-${id}`);
        dispatch(clearBookingSelection());
        clearInterval(interval);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [dispatch, holdExpiresAt, id]);

  const toggleSeat = useCallback((seatId) => {
    const seat = showtime?.seats.find((item) => item.id === seatId);
    dispatch(toggleSelectedSeat({ id: seatId, type: seat?.type }));
  }, [dispatch, showtime]);

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
    setActionError('');
    setNeedsVerification(false);
    dispatch(setBookingStatus('reserving'));

    try {
      const holdResponse = await holdSeats({ showtimeId: id, seatIds: selected }).unwrap();
      const hold = holdResponse.hold;
      dispatch(setBookingHold(hold));

      const orderResponse = await createOrder({
        movie: movie._id,
        showtime: id,
        seats: selected,
        ticketAmount: total,
        totalAmount: total,
        holdId: hold.id,
        holdExpiresAt: hold.expiresAt,
      }).unwrap();

      dispatch(setBookingStatus('reserved'));
      navigate(`/checkout/${orderResponse._id}`);
    } catch (err) {
      if (err.data?.code === 'EMAIL_NOT_VERIFIED' || /verify your email/i.test(err.data?.error || err.message || '')) {
        setNeedsVerification(true);
      } else {
        setActionError(err.data?.error || err.data?.message || err.message || 'Something went wrong');
      }

      dispatch(setBookingStatus('idle'));
      await refetchShowtime();

      sessionStorage.removeItem(`selectedSeats-${id}`);
      dispatch(clearBookingSelection());
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
      setActionError(err.response?.data?.error || err.message);
    } finally {
      setResending(false);
    }
  }

  if (loading) return <p className="py-20 text-center text-marquee-muted">Loading seats...</p>;
  if (!showtime || !movie) return <p className="py-20 text-center text-marquee-muted">{showtimeError?.data?.error || 'Showtime not found.'}</p>;

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
        {actionError && (
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
              <span>{actionError}</span>
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
        <SeatMap seats={showtime.seats} onToggle={toggleSeat} />
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