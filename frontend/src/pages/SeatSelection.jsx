import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import SeatMap from '../components/SeatMap';

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

  useEffect(() => {
    loadShowtime();
  }, [id]);


  useEffect(() => {
    const saved = sessionStorage.getItem(`selectedSeats-${id}`);

    if (!saved) return;

    try {
      const parsed = JSON.parse(saved);

      if (
        parsed.expiresAt &&
        new Date(parsed.expiresAt) > new Date()
      ) {
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
      JSON.stringify({
        seats: selected,
        expiresAt: showtime.holdExpiresAt
      })
    );
  }, [selected, id, showtime]);

  useEffect(() => {
    const savedBooking = sessionStorage.getItem('pendingBooking');

    if (!savedBooking) return;

    const booking = JSON.parse(savedBooking);

    if (
      booking.showtimeId === id &&
      Date.now() - booking.createdAt < 15 * 60 * 1000
    ) {

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

    try {
      const { data } = await api.get(`/showtimes/${id}`);

      setShowtime(data.showtime);
      setMovie(data.movie);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  function toggleSeat(seatId) {
    setSelected(prev => {
      const updated = prev.includes(seatId)
        ? prev.filter(
          seat => seat !== seatId
        )
        : [
          ...prev,
          seatId
        ];
      return updated;
    });
  }

  async function handleContinue() {
    if (!user) {
      sessionStorage.setItem(
        'pendingBooking',
        JSON.stringify({
          showtimeId: id,
          movieId: movie._id,
          seats: selected,
          createdAt: Date.now(),
        })
      );

      navigate('/login', {
        state: {
          from: {
            pathname: `/showtimes/${id}`
          }
        }
      });
      return;
    }

    if (!selected.length) return;

    setSubmitting(true);
    setError('');
    setNeedsVerification(false);

    try {
      const {
        data: holdResponse
      } = await api.post(
        '/hold-seat',
        {
          showtimeId: id,
          seatIds: selected,
        }
      );
      const hold = holdResponse.hold;

      const {
        data: orderResponse
      } = await api.post(
        '/orders',
        {
          movie: movie._id,
          showtime: id,
          seats: selected,
          ticketAmount: total,
          totalAmount: total,
          holdId: hold.id,
          holdExpiresAt: hold.expiresAt
        }
      );

      navigate(
        `/checkout/${orderResponse.order._id}`
      );
    } catch (err) {
      if (
        err.response?.data?.code === 'EMAIL_NOT_VERIFIED'
        ||
        /verify your email/i.test(err.message)
      ) {
        setNeedsVerification(true);
      } else {
        setError(
          err.response?.data?.error ||
          err.message ||
          'Something went wrong'
        );
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
      await api.post('/auth/resend-verification');

      setNeedsVerification('sent');
    } catch (err) {
      setError(err.message);
    } finally {
      setResending(false);
    }
  }

  if (loading)
    return (
      <p className="py-20 text-center text-marquee-muted">
        Loading seats...
      </p>
    );

  if (!showtime || !movie)
    return (
      <p className="py-20 text-center text-marquee-marquee">
        Showtime not found.
      </p>
    );

  const total = selected.length * movie.price;

  return (
    <div className="mx-auto max-w-3xl px-6 py-12">
      <div className="mb-8 text-center">
        <p className="text-xs uppercase tracking-[0.3em] text-marquee-goldDim">
          {new Date(showtime.startTime).toLocaleDateString()}
          {" · "}
          {new Date(showtime.startTime).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit'
          })}
        </p>

        <h1 className="font-serif text-3xl font-bold text-marquee-cream">
          {movie.title}
        </h1>
      </div>

      {error && (
        <p className="mb-6 rounded-md border border-marquee-marquee/40 bg-marquee-marquee/10 px-4 py-2 text-center text-sm text-marquee-marquee">
          {error}
        </p>
      )}

      {needsVerification && (
        <div className="mb-6 rounded-md border border-marquee-gold/40 bg-marquee-gold/10 px-4 py-4 text-center text-sm text-marquee-cream">
          {needsVerification === 'sent'
            ?
            <p>
              A new verification link is on its way.
            </p>
            :
            <>
              <p className="mb-2">
                Please verify your email before booking tickets.
              </p>

              <button
                onClick={handleResend}
                disabled={resending}
                className="rounded-full border border-marquee-gold px-4 py-1.5 text-marquee-gold"
              >
                {resending ? 'Sending...' : 'Resend verification email'}
              </button>
            </>
          }
        </div>
      )}

      <div className="rounded-xl border border-marquee-line bg-marquee-panel p-8">
        <SeatMap
          seats={showtime.seats}
          selected={selected}
          onToggle={toggleSeat}
        />
      </div>

      <div className="ticket-edge mt-8 flex items-center justify-between rounded-lg border border-dashed border-marquee-line bg-marquee-panel2 px-8 py-5">
        <div>
          <p className="text-xs uppercase tracking-widest text-marquee-muted">
            {selected.length} seats selected
          </p>

          <p className="font-mono text-sm text-marquee-muted">
            {selected.join(', ') || '—'}
          </p>
        </div>

        <div className="text-right">
          <p className="font-display text-3xl tracking-wide text-marquee-gold">
            ${total.toFixed(2)}
          </p>
          <button
            onClick={handleContinue}
            disabled={!selected.length || submitting}
            className="mt-2 rounded-full bg-marquee-gold px-6 py-2 font-semibold text-marquee-bg transition disabled:cursor-not-allowed disabled:opacity-40"
          >
            {submitting ? 'Reserving...' : 'Continue to payment'}
          </button>
        </div>
      </div>
    </div>
  );
}