import { X } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'react-toastify';
import { createReview } from '../../api/reviews';
import StarRating from './StarRating';

export default function WriteReviewModal({ movie, onClose, onCreated }) {
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState('');
    const [error, setError] = useState('');
    const [submitting, setSubmitting] = useState(false);

    async function handleSubmit(e) {
        e.preventDefault();
        setError('');

        if (!rating) {
            setError('Please select a rating.');
            return;
        }
        if (comment.trim().length < 3 || comment.trim().length > 1000) {
            setError('Comment must be between 3 and 1000 characters.');
            return;
        }

        setSubmitting(true);
        try {
            const { review } = await createReview({
                movieId: movie._id,
                rating,
                comment: comment.trim(),
            });
            toast.success('Review submitted. Thanks for sharing!');
            onCreated(review);
        } catch (err) {
            setError(err.response?.data?.error || err.message || 'Failed to submit review.');
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <div onClick={() => !submitting && onClose()} className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 px-4 backdrop-blur-sm">
            <div onClick={(e) => e.stopPropagation()} className="w-full max-w-md rounded-2xl border border-marquee-line bg-marquee-panel2 p-6 shadow-2xl">
                <div className="mb-4 flex items-start justify-between gap-4">
                    <div>
                        <h2 className="whitespace-nowrap font-display text-2xl font-semibold tracking-wide text-marquee-goldBright">Write a Review</h2>
                        <h1 className="mt-1 text-xl text-marquee-muted">{movie.title}</h1>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-full p-1 text-marquee-muted hover:text-marquee-gold"
                        aria-label="Close write review dialog"
                    >
                        <X size={18} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <span className="mb-1 block text-sm text-marquee-muted">Rating</span>
                        <StarRating value={rating} onChange={setRating} size={24} />
                    </div>

                    <label className="block">
                        <span className="mb-1 block text-sm text-marquee-muted">Comment</span>
                        <textarea
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            rows={4}
                            maxLength={1000}
                            placeholder="What did you think of the movie?"
                            className="w-full rounded-md border border-marquee-line bg-marquee-panel px-2.5 py-2.5 text-marquee-cream outline-none transition focus:border-marquee-gold"
                        />
                    </label>

                    {error && <p className="text-sm text-marquee-marquee">{error}</p>}

                    <div className="flex justify-end gap-3 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={submitting}
                            className="rounded-full border border-marquee-line px-5 py-2 text-sm text-marquee-muted hover:border-marquee-gold hover:text-marquee-gold disabled:opacity-40"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={submitting}
                            className="rounded-full bg-marquee-gold px-6 py-2 text-sm font-semibold text-marquee-bg transition hover:bg-marquee-goldBright disabled:opacity-40"
                        >
                            {submitting ? 'Submitting...' : 'Submit Review'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}