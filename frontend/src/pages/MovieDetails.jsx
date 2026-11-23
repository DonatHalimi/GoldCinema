import { AnimatePresence, motion } from 'framer-motion';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import FavouriteButton from '../components/FavouriteButton';
import EditReviewModal from '../components/reviews/EditReviewModal';
import StarRating from '../components/reviews/StarRating';
import WriteReviewModal from '../components/reviews/WriteReviewModal';
import { useAuth } from '../context/AuthContext';
import useEscapeKey from '../hooks/useEscKey';
import { useGetMovieQuery, useGetMovieShowtimesQuery } from '../store/api/moviesApiSlice';
import { useGetMovieReviewsQuery } from '../store/api/reviewsApiSlice';
import { useGetMyOrdersQuery } from '../store/api/bookingsApiSlice';
import { useDispatch } from 'react-redux';
import { apiSlice } from '../store/api/apiSlice';

const INITIAL_DATES = 4;
const EMPTY_LIST = [];

export default function MovieDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const dispatch = useDispatch();

  const { currentData: movie, isLoading: movieLoading, error: movieError } = useGetMovieQuery(id);
  const { currentData: showtimes = EMPTY_LIST, isLoading: showtimesLoading, error: showtimesError } = useGetMovieShowtimesQuery(id);
  const [selectedDate, setSelectedDate] = useState(null);
  const [showAllDates, setShowAllDates] = useState(false);

  const [reviewsPage, setReviewsPage] = useState(1);
  const { data: reviewsResult, isFetching: reviewsLoading, error: reviewsQueryError } = useGetMovieReviewsQuery({ movieId: id, page: reviewsPage });
  const reviews = reviewsResult?.reviews || EMPTY_LIST;
  const reviewsPages = reviewsResult?.pages || 1;
  const reviewsError = reviewsQueryError?.data?.error || reviewsQueryError?.message || '';
  const { data: myOrders = EMPTY_LIST, isLoading: ordersLoading } = useGetMyOrdersQuery(undefined, { skip: !user });

  const [eligible, setEligible] = useState(false);
  const [eligibilityChecked, setEligibilityChecked] = useState(false);

  const [showWriteModal, setShowWriteModal] = useState(false);
  const [editingOwnReview, setEditingOwnReview] = useState(null);

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
    if (!user) {
      setEligible(false);
      setEligibilityChecked(true);
      return;
    }

    if (ordersLoading) return;
    setEligible(myOrders.some((order) => order.movie?._id === id && order.paymentStatus === 'paid'));
    setEligibilityChecked(true);
  }, [id, user, myOrders, ordersLoading]);

  useEffect(() => {
    const dates = [...new Set(showtimes.map((showtime) => showtime.date))].sort();
    if (!selectedDate || !dates.includes(selectedDate)) setSelectedDate(dates[0] || null);
  }, [id, selectedDate, showtimes]);

  const myReview = useMemo(
    () => (user ? reviews.find((r) => r.user?._id === user.id) : null),
    [reviews, user]
  );

  function handleReviewCreated() {
    setShowWriteModal(false);
    dispatch(apiSlice.util.invalidateTags([
      { type: 'Reviews', id: `MOVIE-${id}` },
      { type: 'Movies', id },
    ]));
  }

  function handleReviewSaved() {
    setEditingOwnReview(null);
    dispatch(apiSlice.util.invalidateTags([
      { type: 'Reviews', id: `MOVIE-${id}` },
      { type: 'Movies', id },
    ]));
  }

  const dates = useMemo(
    () => [...new Set(showtimes.map((s) => s.date))].sort(),
    [showtimes]
  );

  const visibleDates = showAllDates ? dates : dates.slice(0, INITIAL_DATES);
  const hiddenDateCount = Math.max(0, dates.length - INITIAL_DATES);

  const showtimesForDate = showtimes.filter((s) => s.date === selectedDate);

  if (movieLoading || showtimesLoading) {
    return <p className="py-20 text-center text-marquee-muted">Loading...</p>;
  }
  if (movieError || showtimesError || !movie) {
    return <p className="py-20 text-center text-marquee-marquee">{movieError?.data?.error || showtimesError?.data?.error || 'Movie not found.'}</p>;
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

          <div className="absolute right-3 top-3 z-10">
            <FavouriteButton itemType="movie" itemId={movie._id} />
          </div>
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

            <motion.div layout className="space-y-3">
              <div className="flex flex-wrap gap-2">
                <AnimatePresence initial={false} mode="popLayout">
                  {visibleDates.map((date) => (
                    <motion.button
                      key={date}
                      layout
                      initial={{ opacity: 0, y: -12 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 12, scale: 0.95 }}
                      transition={{ duration: 0.2, ease: 'easeInOut' }}
                      onClick={() => setSelectedDate(date)}
                      className={`rounded-full border px-4 py-2 text-sm transition ${selectedDate === date
                        ? 'border-marquee-gold bg-marquee-gold text-marquee-bg'
                        : 'border-marquee-line text-marquee-muted hover:border-marquee-gold hover:text-marquee-gold'
                        }`}
                    >
                      {formatDate(date)}
                    </motion.button>
                  ))}
                </AnimatePresence>
              </div>

              {dates.length > INITIAL_DATES && (
                <button
                  type="button"
                  onClick={() => setShowAllDates((prev) => !prev)}
                  className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-marquee-line bg-marquee-panel2 py-2 text-xs font-medium text-marquee-gold transition hover:bg-marquee-line/20"
                >
                  {showAllDates ? (
                    <>
                      <span>See less</span>
                      <ChevronUp className="h-4 w-4" />
                    </>
                  ) : (
                    <>
                      <span>See more ({hiddenDateCount} more)</span>
                      <ChevronDown className="h-4 w-4" />
                    </>
                  )}
                </button>
              )}
            </motion.div>

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
                  Only ticket buyers can review this movie.
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
              onClick={() => setReviewsPage((page) => page - 1)}
              className="rounded-full border border-marquee-line px-4 py-1.5 disabled:opacity-40"
            >
              Previous
            </button>
            <span>
              Page {reviewsPage} of {reviewsPages}
            </span>
            <button
              disabled={reviewsPage === reviewsPages}
              onClick={() => setReviewsPage((page) => page + 1)}
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