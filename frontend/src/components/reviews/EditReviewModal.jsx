import { CheckCircle, Loader2, XCircle } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { updateReview } from '../../api/reviews';
import Modal from '../ui/modals/Modal';
import StarRating from './StarRating';

export default function EditReviewModal({
    review,
    onClose,
    onSaved,
}) {
    const [rating, setRating] = useState(review?.rating || 0);
    const [comment, setComment] = useState(review?.comment || '');
    const [error, setError] = useState('');
    const [saving, setSaving] = useState(false);
    const [success, setSuccess] = useState('');

    const movieTitle = review?.movie?.title || 'this movie';

    useEffect(() => {
        setRating(review?.rating || 0);
        setComment(review?.comment || '');
        setError('');
        setSuccess('');
    }, [review]);

    async function handleSubmit(e) {
        e.preventDefault();

        setError('');
        setSuccess('');

        if (!rating) {
            setError('Please select a rating.');
            return;
        }

        const trimmedComment = comment.trim();

        if (
            trimmedComment.length < 3 ||
            trimmedComment.length > 1000
        ) {
            setError(
                'Comment must be between 3 and 1000 characters.'
            );
            return;
        }

        setSaving(true);

        try {
            const { review: updated } = await updateReview(review._id, {
                rating,
                comment: trimmedComment,
            });

            const successMessage = 'Review updated successfully';

            setSuccess(successMessage);
            toast.success(successMessage);

            onSaved(updated);
        } catch (err) {
            const errorMessage =
                err.response?.data?.error ||
                err.message ||
                'Failed to update review.';

            setError(errorMessage);
            toast.error(errorMessage);
        } finally {
            setSaving(false);
        }
    }

    return (
        <Modal
            isOpen={true}
            onClose={onClose}
            title="Edit Review"
            closeDisabled={saving}
        >
            <div className="mt-5">
                <p className="text-sm text-marquee-muted">
                    Editing your review for{' '}
                    <span className="font-semibold text-marquee-cream">
                        {movieTitle}
                    </span>
                </p>
            </div>

            {error && (
                <div className="mt-5 flex items-start gap-3 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3">
                    <XCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-400" />

                    <div>
                        <p className="text-sm font-semibold text-red-400">
                            Unable to update review
                        </p>

                        <p className="mt-1 text-sm text-red-300/90">
                            {error}
                        </p>
                    </div>
                </div>
            )}

            {success && (
                <div className="mt-5 flex items-start gap-3 rounded-lg border border-green-500/30 bg-green-500/10 px-4 py-3">
                    <CheckCircle className="mt-0.5 h-5 w-5 shrink-0 text-green-400" />

                    <div>
                        <p className="text-sm font-semibold text-green-400">
                            Review updated
                        </p>

                        <p className="mt-1 text-sm text-green-300/90">
                            {success}
                        </p>
                    </div>
                </div>
            )}

            <form
                onSubmit={handleSubmit}
                className="mt-6 space-y-5"
            >
                <div>
                    <span className="mb-2 block text-sm font-medium text-marquee-muted">
                        Rating
                    </span>

                    <StarRating
                        value={rating}
                        onChange={(value) => {
                            setRating(value);
                            setError('');
                        }}
                        size={24}
                    />
                </div>

                <label className="block">
                    <div className="mb-2 flex items-center justify-between">
                        <span className="text-sm font-medium text-marquee-muted">
                            Comment
                        </span>

                        <span className="text-xs text-marquee-muted">
                            {comment.length}/1000
                        </span>
                    </div>

                    <textarea
                        value={comment}
                        onChange={(e) => {
                            setComment(e.target.value);
                            setError('');
                        }}
                        rows={5}
                        maxLength={1000}
                        disabled={saving}
                        className="w-full resize-none rounded-lg border border-marquee-line bg-marquee-panel2 px-3 py-2.5 text-sm text-marquee-cream outline-none transition focus:border-marquee-gold disabled:cursor-not-allowed disabled:opacity-60"
                    />
                </label>

                <div className="flex justify-end gap-3 pt-2">
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={saving}
                        className="rounded-full border border-marquee-line px-4 py-2 text-sm text-marquee-muted transition-colors hover:border-marquee-gold hover:text-marquee-cream disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        Cancel
                    </button>

                    <button
                        type="submit"
                        disabled={saving}
                        className="inline-flex items-center gap-2 rounded-full bg-marquee-gold px-5 py-2 text-sm font-semibold text-marquee-bg transition-all hover:bg-marquee-goldBright disabled:cursor-not-allowed disabled:opacity-40"
                    >
                        {saving && (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        )}

                        {saving ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>
            </form>
        </Modal>
    );
}