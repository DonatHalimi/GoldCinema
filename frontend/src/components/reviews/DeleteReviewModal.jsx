import { CheckCircle, Loader2, TriangleAlert, XCircle } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'react-toastify';
import { deleteReview } from '../../api/reviews';
import Modal from '../ui/modals/Modal';

export default function DeleteReviewModal({
    review,
    onClose,
    onDeleted,
}) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const movieTitle = review?.movie?.title || 'this movie';

    const handleDelete = async () => {
        setError('');
        setSuccess('');

        try {
            setLoading(true);

            await deleteReview(review._id);

            const successMessage = 'Your review has been deleted successfully.';

            setSuccess(successMessage);
            toast.success(successMessage);

            onDeleted(review._id);
        } catch (err) {
            const errorMessage =
                err.response?.data?.error ||
                err.message ||
                'Unable to delete review. Please try again.';

            setError(errorMessage);
            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal
            isOpen={true}
            onClose={onClose}
            title="Delete Review"
            closeDisabled={loading}
        >
            <div className="mt-5 rounded-lg border border-red-500/20 bg-red-500/5 p-4">
                <div className="flex items-center gap-2">
                    <TriangleAlert className="h-4 w-4 shrink-0 text-red-400" />

                    <p className="text-sm font-semibold text-red-400">
                        This action cannot be undone.
                    </p>
                </div>

                <p className="mt-2 text-sm leading-relaxed text-marquee-muted">
                    Your review for{' '}
                    <span className="font-semibold text-marquee-cream">
                        {movieTitle}
                    </span>{' '}
                    will be permanently deleted.
                </p>
            </div>

            {error && (
                <div className="mt-5 flex items-start gap-3 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3">
                    <XCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-400" />

                    <div>
                        <p className="text-sm font-semibold text-red-400">
                            Unable to delete review
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
                            Review deleted
                        </p>

                        <p className="mt-1 text-sm text-green-300/90">
                            {success}
                        </p>
                    </div>
                </div>
            )}

            <div className="mt-7 flex justify-end gap-3">
                <button
                    type="button"
                    onClick={onClose}
                    disabled={loading}
                    className="rounded-full border border-marquee-line px-4 py-2 text-sm text-marquee-muted transition-colors hover:border-marquee-gold hover:text-marquee-cream disabled:cursor-not-allowed disabled:opacity-50"
                >
                    Cancel
                </button>

                <button
                    type="button"
                    onClick={handleDelete}
                    disabled={loading}
                    className="inline-flex items-center gap-2 rounded-full bg-red-600 px-5 py-2 text-sm font-semibold text-white transition-all hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-40"
                >
                    {loading && (
                        <Loader2 className="h-4 w-4 animate-spin" />
                    )}

                    {loading ? 'Deleting...' : 'Delete Review'}
                </button>
            </div>
        </Modal>
    );
}