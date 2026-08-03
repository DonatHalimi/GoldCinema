import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../api/client';

export default function MovieDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [movie, setMovie] = useState(null);
  const [showtimes, setShowtimes] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    Promise.all([api.get(`/movies/${id}`), api.get(`/movies/${id}/showtimes`)])
      .then(([movieRes, showtimeRes]) => {
        setMovie(movieRes.data.movie);
        setShowtimes(showtimeRes.data.showtimes);
        const dates = [...new Set(showtimeRes.data.showtimes.map((s) => s.date))].sort();
        setSelectedDate(dates[0]);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  const dates = useMemo(
    () => [...new Set(showtimes.map((s) => s.date))].sort(),
    [showtimes]
  );

  const showtimesForDate = showtimes.filter((s) => s.date === selectedDate);

  if (loading) {
    return <p className="py-20 text-center text-marquee-muted">Loading...</p>;
  }
  if (error || !movie) {
    return <p className="py-20 text-center text-marquee-marquee">{error || 'Movie not found.'}</p>;
  }

  return (
    <div className="mx-auto max-w-5xl px-6 py-12">
      <div className="grid gap-10 sm:grid-cols-[280px_1fr]">
        <img
          src={movie.posterUrl}
          alt={`${movie.title} poster`}
          className="aspect-[2/3] w-full rounded-lg border border-marquee-line object-cover shadow-glow"
        />

        <div>
          <div className="mb-2 flex items-center gap-2 text-xs uppercase tracking-wider text-marquee-goldDim">
            {movie.genres?.join(' / ')}
            <span aria-hidden="true">&middot;</span>
            <span>{movie.rating}</span>
            <span aria-hidden="true">&middot;</span>
            <span>{movie.duration} min</span>
          </div>
          <h1 className="font-serif text-4xl font-bold text-marquee-cream">{movie.title}</h1>
          <p className="mt-4 max-w-xl leading-relaxed text-marquee-muted">{movie.synopsis}</p>
          <p className="mt-4 font-display text-2xl tracking-wide text-marquee-gold">
            ${movie.price.toFixed(2)} <span className="font-body text-sm text-marquee-muted">per seat</span>
          </p>

          <div className="mt-10">
            <h2 className="mb-3 font-body text-sm uppercase tracking-widest text-marquee-muted">
              Select a date
            </h2>
            <div className="flex flex-wrap gap-2">
              {dates.map((date) => (
                <button
                  key={date}
                  onClick={() => setSelectedDate(date)}
                  className={`rounded-full border px-4 py-2 text-sm transition ${selectedDate === date
                    ? 'border-marquee-gold bg-marquee-gold text-marquee-bg'
                    : 'border-marquee-line text-marquee-muted hover:border-marquee-gold hover:text-marquee-gold'
                    }`}
                >
                  {formatDate(date)}
                </button>
              ))}
            </div>

            <h2 className="mb-3 mt-8 font-body text-sm uppercase tracking-widest text-marquee-muted">
              Select a showtime
            </h2>
            <div className="flex flex-wrap gap-3">
              {showtimesForDate.map((s) => (
                <button
                  key={s.id}
                  disabled={s.seatsAvailable === 0}
                  onClick={() => navigate(`/showtimes/${s.id}`)}
                  className="flex min-w-[110px] flex-col items-center rounded-lg border border-marquee-line bg-marquee-panel px-4 py-3 text-marquee-cream transition hover:border-marquee-gold hover:text-marquee-gold disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <span className="font-display text-xl tracking-wide">{s.time}</span>
                  <span className="text-xs text-marquee-muted">
                    {s.hall} &middot; {s.seatsAvailable === 0 ? 'Sold out' : `${s.seatsAvailable} left`}
                  </span>
                </button>
              ))}
              {showtimesForDate.length === 0 && (
                <p className="text-sm text-marquee-muted">No showtimes on this date.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function formatDate(dateStr) {
  const date = new Date(`${dateStr}T00:00:00`);
  return date.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
}
