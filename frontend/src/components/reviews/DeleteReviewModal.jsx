import { CheckCircle, Loader2, TriangleAlert, XCircle } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import { deleteReview } from '../../api/reviews';
import Modal from '../ui/modals/Modal';

export default function DeleteReviewModal({
    review,
    onClose,
    onDeleted,
}) {
    const { t } = useTranslation('account');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const movieTitle = review?.movie?.title || t('reviewThisMovie');

    const handleDelete = async () => {
        setError('');
        setSuccess('');

        try {
            setLoading(true);
            await deleteReview(review._id);
            const successMessage = t('reviewDeletedSuccessfully');
            setSuccess(successMessage);
            toast.success(successMessage);

            onDeleted(review._id);
        } catch (err) {
            const errorMessage =
                err.response?.data?.error ||
                err.message ||
                t('unableToDeleteReviewTryAgain');

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
            title={t('deleteReview')}
            closeDisabled={loading}
        >
            <div className="mt-5 rounded-lg border border-red-500/20 bg-red-500/5 p-4">
                <div className="flex items-center gap-2">
                    <TriangleAlert className="h-4 w-4 shrink-0 text-red-400" />

                    <p className="text-sm font-semibold text-red-400">
                        {t('deleteReviewWarning')}
                    </p>
                </div>

                <p className="mt-2 text-sm leading-relaxed text-marquee-muted">
                    {t('deleteReviewConfirmation')}{' '}

                    <span className="font-semibold text-marquee-cream">
                        {movieTitle}
                    </span>{' '}

                    {t('reviewWillBeDeleted')}
                </p>
            </div>

            {error && (
                <div className="mt-5 flex items-start gap-3 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3">
                    <XCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-400" />

                    <div>
                        <p className="text-sm font-semibold text-red-400">
                            {t('unableToDeleteReview')}
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
                            {t('reviewDeleted')}
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
                    className="inline-flex items-center gap-1.5 rounded-lg border border-marquee-line px-3 py-2 text-xs font-medium text-marquee-muted transition hover:border-marquee-gold/40 hover:text-marquee-gold disabled:opacity-50"
                >
                    {t('cancelReview')}
                </button>

                <button
                    type="button"
                    onClick={handleDelete}
                    disabled={loading}
                    className="inline-flex shrink-0 items-center gap-2 whitespace-nowrap rounded-lg border border-red-500/50 bg-red-600 px-6 py-3 text-sm font-semibold text-white transition-colors duration-200 hover:border-red-400 hover:bg-red-500 active:bg-red-700 disabled:opacity-50 disabled:hover:bg-red-600"                >
                    {loading && <Loader2 className="h-4 w-4 animate-spin" />}

                    {loading ? t('deletingReview') : t('deleteReview')}
                </button>
            </div>
        </Modal>
    );
}