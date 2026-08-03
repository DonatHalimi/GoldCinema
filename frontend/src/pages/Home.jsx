import { useEffect, useState } from 'react';
import api from '../api/client';
import MovieCard from '../components/MovieCard';
import { useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';

export default function Home() {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api
      .get('/movies')
      .then(({ data }) => setMovies(data.movies))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (location.state?.registered) {
      toast.success(
        'Account created! Verification email has been sent. Check your inbox'
      );

      window.history.replaceState({}, document.title);
    }
  }, [location]);

  return (
    <div className="mx-auto max-w-6xl px-6 py-12">
      <section className="mb-14 text-center">
        <p className="mb-3 font-body text-xs uppercase tracking-[0.4em] text-marquee-goldDim">
          Tonight's lineup
        </p>
        <h1 className="font-display text-5xl tracking-wide text-marquee-goldBright sm:text-6xl">
          NOW SHOWING
        </h1>
        <p className="mx-auto mt-4 max-w-xl font-serif text-marquee-muted">
          Pick a film, choose your seats, and step into the dark. Doors open every day, all day.
        </p>
      </section>

      {loading && <p className="text-center text-marquee-muted">Loading showtimes...</p>}
      {error && <p className="text-center text-marquee-marquee">{error}</p>}

      <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-4">
        {movies.map((movie) => (
          <MovieCard key={movie.id} movie={movie} />
        ))}
      </div>
    </div>
  );
}