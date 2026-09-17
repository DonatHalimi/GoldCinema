import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import api from '../api/client';
import MovieCard from '../components/movies/MovieCard';
import { useTranslation } from 'react-i18next';

export default function Home() {
  const { t } = useTranslation('home');

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
  }, []);

  return (
    <div className="mx-auto max-w-6xl px-6 py-12">
      <section className="mb-14 text-center">
        <p className="mb-3 font-body text-xs uppercase tracking-[0.4em] text-marquee-goldDim">
          {t('overline')}
        </p>

        <h1 className="font-display text-5xl tracking-wide text-marquee-goldBright sm:text-6xl">
          {t('header')}
        </h1>

        <p className="mx-auto mt-4 max-w-xxl font-serif text-marquee-muted">
          {t('homeDescription')}
        </p>
      </section>

      {loading && (
        <p className="text-center text-marquee-muted">
          {t('loadingShowtimes')}
        </p>
      )}

      {error && (
        <p className="text-center text-marquee-marquee">
          {error}
        </p>
      )}

      <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-4">
        {movies.map((movie) => (
          <MovieCard key={movie.id} movie={movie} />
        ))}
      </div>
    </div>
  );
}