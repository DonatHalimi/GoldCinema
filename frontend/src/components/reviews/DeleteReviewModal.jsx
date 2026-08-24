import { useState } from 'react';
import { X, Loader2 } from 'lucide-react';
import { toast } from 'react-toastify';
import { deleteReview } from '../../api/client';

export default function DeleteReviewModal({ review, onClose, onDeleted }) {
    const [deleting, setDeleting] = useState(false);
    const [error, setError] = useState('');

    async function handleDelete() {
        setDeleting(true);
        setError('');
        try {
            await deleteReview(review._id);
            toast.success('Review deleted.');
            onDeleted(review._id);
        } catch (err) {
            setError(err.response?.data?.error || err.message || 'Failed to delete review.');
        } finally {
            setDeleting(false);
        }
    }

    return (
        <div onClick={() => !deleting && onClose()} className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 px-4 backdrop-blur-sm">
            <div onClick={(e) => e.stopPropagation()} className="w-full max-w-md rounded-2xl border border-marquee-line bg-marquee-panel2 p-6 shadow-2xl">
                <div className="mb-4 flex items-start justify-between gap-4">
                    <h2 className="font-serif text-2xl font-bold text-marquee-cream">Delete Review</h2>
                    <button
                        type="button"
                        onClick={() => !deleting && onClose()}
                        disabled={deleting}
                        className="rounded-full p-1 text-marquee-muted hover:text-marquee-gold disabled:opacity-50"
                        aria-label="Close delete review dialog"
                    >
                        <X size={18} />
                    </button>
                </div>

                <p className="text-sm text-marquee-muted">
                    Are you sure you want to delete your review for{' '}
                    <span className="text-marquee-cream">{review.movie?.title || 'this movie'}</span>?
                    This action cannot be undone.
                </p>

                {error && <p className="mt-3 text-sm text-marquee-marquee">{error}</p>}

                <div className="mt-6 flex justify-end gap-3">
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={deleting}
                        className="rounded-full border border-marquee-line px-5 py-2 text-sm text-marquee-muted hover:border-marquee-gold hover:text-marquee-gold disabled:opacity-40"
                    >
                        Cancel
                    </button>
                    <button
                        type="button"
                        onClick={handleDelete}
                        disabled={deleting}
                        className="flex items-center gap-2 rounded-full bg-red-600 px-5 py-2 text-sm font-semibold text-white hover:bg-red-500 disabled:opacity-50"
                    >
                        {deleting && <Loader2 size={16} className="animate-spin" />}
                        {deleting ? 'Deleting...' : 'Delete Review'}
                    </button>
                </div>
            </div>
        </div>
    );
}