import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../api/client';
import { getMovieReviews } from '../api/reviews';
import FavouriteButton from '../components/FavouriteButton';
import EditReviewModal from '../components/reviews/EditReviewModal';
import StarRating from '../components/reviews/StarRating';
import WriteReviewModal from '../components/reviews/WriteReviewModal';
import { useAuth } from '../context/AuthContext';
import useEscapeKey from '../hooks/useEscKey';
import { getMovieById, getMovieShowtimes } from '../api/movies';

export default function MovieDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [movie, setMovie] = useState(null);
  const [showtimes, setShowtimes] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [reviews, setReviews] = useState([]);
  const [reviewsPage, setReviewsPage] = useState(1);
  const [reviewsPages, setReviewsPages] = useState(1);
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const [reviewsError, setReviewsError] = useState('');

  const [eligible, setEligible] = useState(false);
  const [eligibilityChecked, setEligibilityChecked] = useState(false);

  const [showWriteModal, setShowWriteModal] = useState(false);
  const [editingOwnReview, setEditingOwnReview] = useState(null);

  useEffect(() => {
    setLoading(true);
    Promise.all([getMovieById(id), getMovieShowtimes(id)])
      .then(([movieData, showtimeData]) => {
        setMovie(movieData.movie);
        setShowtimes(showtimeData.showtimes);
        const dates = [
          ...new Set(showtimeData.showtimes.map((s) => s.date))
        ].sort();
        setSelectedDate(dates[0]);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  useEscapeKey(
    () => {
      if (showWriteModal) {
        setShowWriteModal(false);
      }
      if (editingOwnReview) {
        setEditingOwnReview(null);
      }
    },
    showWriteModal || editingOwnReview
  );

  useEffect(() => {
    loadReviews(1);
  }, [id]);

  useEffect(() => {
    if (!user) {
      setEligible(false);
      setEligibilityChecked(true);
      return;
    }

    api
      .get('/orders/mine')
      .then(({ data }) => {
        const hasPaidOrder = (data.orders || []).some(
          (order) => order.movie?._id === id && order.paymentStatus === 'paid'
        );
        setEligible(hasPaidOrder);
      })
      .catch(() => setEligible(false))
      .finally(() => setEligibilityChecked(true));
  }, [id, user]);

  async function loadReviews(page) {
    setReviewsLoading(true);
    setReviewsError('');
    try {
      const data = await getMovieReviews(id, page);
      setReviews(data.reviews || []);
      setReviewsPage(data.page);
      setReviewsPages(data.pages || 1);
    } catch (err) {
      setReviewsError(
        err.response?.data?.error || err.message || 'Unable to load reviews. Please try again.'
      );
    } finally {
      setReviewsLoading(false);
    }
  }

  const myReview = useMemo(
    () => (user ? reviews.find((r) => r.user?._id === user.id) : null),
    [reviews, user]
  );

  function handleReviewCreated(review) {
    setShowWriteModal(false);
    setReviews((prev) => [review, ...prev]);
    getMovieById(id).then(({ data }) => setMovie(data.movie));
  }

  function handleReviewSaved(updated) {
    setEditingOwnReview(null);
    setReviews((prev) => prev.map((r) => (r._id === updated._id ? updated : r)));
    getMovieById(id).then(({ data }) => setMovie(data.movie));
  }

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
    <div tabIndex={0} className="mx-auto max-w-5xl px-6 py-12">
      <div className="grid gap-10 sm:grid-cols-[280px_1fr]">
        <div className="relative">
          <img
            src={movie.posterUrl}
            alt={`${movie.title} poster`}
            className="aspect-[2/3] w-full rounded-lg border border-marquee-line object-cover shadow-glow"
          />

          <FavouriteButton
            itemType="movie"
            itemId={movie._id}
            className="absolute right-3 top-3 z-10"
          />
        </div>

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

      <div className="mt-16 border-t border-marquee-line pt-10">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="font-serif text-2xl font-bold text-marquee-cream">Reviews</h2>
            <div className="mt-2 flex items-center gap-2">
              <StarRating value={Math.round(movie.averageRating || 0)} readOnly size={18} />
              <span className="text-marquee-gold">{(movie.averageRating || 0).toFixed(1)}</span>
              <span className="text-sm text-marquee-muted">
                Based on {movie.reviewCount || 0} review{movie.reviewCount === 1 ? '' : 's'}
              </span>
            </div>
          </div>

          {eligibilityChecked && (
            <div>
              {!user ? null : myReview ? (
                <button
                  onClick={() => setEditingOwnReview(myReview)}
                  className="rounded-full border border-marquee-gold px-5 py-2 text-sm text-marquee-gold hover:bg-marquee-gold hover:text-marquee-bg"
                >
                  Edit Your Review
                </button>
              ) : eligible ? (
                <button
                  onClick={() => setShowWriteModal(true)}
                  className="rounded-full bg-marquee-gold px-5 py-2 text-sm font-semibold text-marquee-bg hover:bg-marquee-goldBright"
                >
                  Write a Review
                </button>
              ) : (
                <p className="max-w-xs text-right text-xs text-marquee-muted">
                  Only users who have purchased a ticket for this movie can leave a review.
                </p>
              )}
            </div>
          )}
        </div>

        <div className="mt-8 space-y-6">
          {reviewsLoading && <p className="text-marquee-muted">Loading reviews...</p>}
          {reviewsError && <p className="text-marquee-marquee">{reviewsError}</p>}

          {!reviewsLoading && !reviewsError && reviews.length === 0 && (
            <p className="text-marquee-muted">No reviews yet. Be the first to share your thoughts.</p>
          )}

          {!reviewsLoading &&
            !reviewsError &&
            reviews.map((review) => (
              <div key={review._id} className="border-b border-marquee-line/50 pb-6">
                <div className="flex items-center justify-between">
                  <p className="font-semibold text-marquee-cream">{review.user?.name || 'GoldCinema patron'}</p>
                  <span className="text-xs text-marquee-muted">
                    {new Date(review.createdAt).toLocaleDateString(undefined, {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </span>
                </div>
                <div className="mt-1">
                  <StarRating value={review.rating} readOnly size={14} />
                </div>
                <p className="mt-2 whitespace-pre-wrap text-sm text-marquee-muted">{review.comment}</p>
              </div>
            ))}
        </div>

        {reviewsPages > 1 && (
          <div className="mt-6 flex items-center justify-center gap-3 text-sm text-marquee-muted">
            <button
              disabled={reviewsPage === 1}
              onClick={() => loadReviews(reviewsPage - 1)}
              className="rounded-full border border-marquee-line px-4 py-1.5 disabled:opacity-40"
            >
              Previous
            </button>
            <span>
              Page {reviewsPage} of {reviewsPages}
            </span>
            <button
              disabled={reviewsPage === reviewsPages}
              onClick={() => loadReviews(reviewsPage + 1)}
              className="rounded-full border border-marquee-line px-4 py-1.5 disabled:opacity-40"
            >
              Next
            </button>
          </div>
        )}
      </div>

      {showWriteModal && (
        <WriteReviewModal
          movie={movie}
          onClose={() => setShowWriteModal(false)}
          onCreated={handleReviewCreated}
        />
      )}

      {editingOwnReview && (
        <EditReviewModal
          review={editingOwnReview}
          movie={movie}
          onClose={() => setEditingOwnReview(null)}
          onSaved={handleReviewSaved}
        />
      )}
    </div>
  );
}

function formatDate(dateStr) {
  const date = new Date(`${dateStr}T00:00:00`);
  return date.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
}