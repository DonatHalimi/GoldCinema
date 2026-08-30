import { MessageSquare } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMyReviews } from '../api/reviews';
import DeleteReviewModal from '../components/reviews/DeleteReviewModal';
import EditReviewModal from '../components/reviews/EditReviewModal';
import ReviewCard from '../components/reviews/ReviewCard';

export default function MyReviews() {
    const navigate = useNavigate();

    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const [editingReview, setEditingReview] = useState(null);
    const [deletingReview, setDeletingReview] = useState(null);

    useEffect(() => {
        loadReviews();
    }, []);

    async function loadReviews() {
        setLoading(true);
        setError('');
        try {
            const { reviews } = await getMyReviews();
            setReviews(reviews || []);
        } catch (err) {
            setError(
                err.response?.data?.error || err.message || 'Unable to load your reviews. Please try again.'
            );
        } finally {
            setLoading(false);
        }
    }

    function handleSaved(updated) {
        setReviews((prev) => prev.map((r) => (r._id === updated._id ? updated : r)));
        setEditingReview(null);
    }

    function handleDeleted(reviewId) {
        setReviews((prev) => prev.filter((r) => r._id !== reviewId));
        setDeletingReview(null);
    }

    return (
        <>
            <div>
                <h2 className="whitespace-nowrap font-display text-2xl font-semibold tracking-wide text-marquee-goldBright">My Reviews</h2>
                <p className="mt-1 mb-8 text-sm text-marquee-muted">
                    Reviews you've shared about movies you've watched
                </p>
            </div>

            {loading && <p className="text-marquee-muted">Loading your reviews...</p>}

            {error && <p className="text-marquee-marquee">{error}</p>}

            {!loading && !error && reviews.length === 0 && (
                <div className="rounded-xl border border-dashed border-marquee-line p-10 text-center">
                    <MessageSquare className="mx-auto mb-3 h-10 w-10 text-marquee-goldDim" />
                    <p className="text-marquee-cream">No reviews yet</p>
                    <p className="mt-1 text-sm text-marquee-muted">
                        Reviews you leave for movies you've watched will appear here
                    </p>
                    <button
                        onClick={() => navigate('/')}
                        className="mt-4 inline-block rounded-full bg-marquee-gold px-6 py-2 font-semibold text-marquee-bg"
                    >
                        Browse Movies
                    </button>
                </div>
            )}

            {!loading && !error && reviews.length > 0 && (
                <div className="space-y-4">
                    {reviews.map((review) => (
                        <ReviewCard
                            key={review._id}
                            review={review}
                            onEdit={setEditingReview}
                            onDelete={setDeletingReview}
                        />
                    ))}
                </div>
            )}

            {editingReview && (
                <EditReviewModal
                    review={editingReview}
                    onClose={() => setEditingReview(null)}
                    onSaved={handleSaved}
                />
            )}

            {deletingReview && (
                <DeleteReviewModal
                    review={deletingReview}
                    onClose={() => setDeletingReview(null)}
                    onDeleted={handleDeleted}
                />
            )}
        </>
    );
}