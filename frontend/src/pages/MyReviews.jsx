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
        <div className="w-full">
            <main className="w-full rounded-xl bg-marquee-panel">
                <div>
                    <div className="mb-8 border-b border-marquee-line pb-6">
                        <h2 className="whitespace-nowrap font-display text-2xl font-semibold tracking-wide text-marquee-goldBright">
                            My Reviews
                        </h2>

                        <p className="mt-1 text-sm text-marquee-muted">
                            Reviews you've shared about movies you've watched
                        </p>
                    </div>

                    {loading && (
                        <div className="flex items-center justify-center rounded-xl border border-marquee-line bg-marquee-panel2 p-10">
                            <p className="text-sm text-marquee-muted">
                                Loading your reviews...
                            </p>
                        </div>
                    )}

                    {error && !loading && (
                        <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-6 text-center">
                            <p className="text-sm text-red-400">
                                {error}
                            </p>
                        </div>
                    )}

                    {!loading && !error && reviews.length === 0 && (
                        <div className="rounded-xl border border-dashed border-marquee-line bg-marquee-panel2 p-10 text-center">
                            <MessageSquare className="mx-auto mb-3 h-10 w-10 text-marquee-goldDim" />

                            <p className="font-serif text-xl text-marquee-cream">
                                No reviews yet
                            </p>

                            <p className="mt-1 text-sm text-marquee-muted">
                                Reviews you leave for movies you've watched
                                will appear here
                            </p>

                            <button
                                type="button"
                                onClick={() => navigate('/')}
                                className="mt-5 inline-flex items-center rounded-full bg-marquee-gold px-6 py-2.5 text-sm font-semibold text-marquee-bg transition hover:bg-marquee-goldBright"
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
                </div>
            </main >
        </div >
    );
}