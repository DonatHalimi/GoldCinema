import { useState } from 'react';
import { Gift } from 'lucide-react';
import { finalizeOrderWithGiftCard } from '../../api/giftCard';

export default function GiftCardFullCoverage({ order, onSuccess }) {
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');

    async function handleConfirm() {
        setSubmitting(true);
        setError('');

        try {
            const data = await finalizeOrderWithGiftCard(order._id);
            onSuccess(data.order);
        } catch (err) {
            setError(
                err.response?.data?.error ||
                err.message ||
                'Failed to complete order.'
            );
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <div className="rounded-xl border border-marquee-gold/40 bg-marquee-gold/10 p-6 text-center">
            <Gift className="mx-auto mb-3 h-8 w-8 text-marquee-gold" />
            <p className="text-marquee-cream">
                Your gift card covers this order in full — no card payment needed.
            </p>
            {error && <p className="mt-3 text-sm text-marquee-marquee">{error}</p>}
            <button
                type="button"
                onClick={handleConfirm}
                disabled={submitting}
                className="mt-5 rounded-full bg-marquee-gold px-6 py-3 font-semibold text-marquee-bg transition hover:bg-marquee-goldBright disabled:opacity-40"
            >
                {submitting ? 'Finalizing...' : 'Complete order'}
            </button>
        </div>
    );
}