import { CardElement, Elements, useElements, useStripe } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { createSetupIntent } from '../../api/payments';

const stripePromise = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY
    ? loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY)
    : null;

const CARD_ELEMENT_OPTIONS = {
    style: {
        base: {
            color: '#F3ECDD',
            fontFamily: '"Inter", system-ui, sans-serif',
            fontSize: '15px',
            '::placeholder': { color: '#B8AD95' },
        },
        invalid: { color: '#B9482F' },
    },
};

function AddCardForm({ onSuccess, onClose }) {
    const stripe = useStripe();
    const elements = useElements();

    const [clientSecret, setClientSecret] = useState(null);
    const [loadError, setLoadError] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [cardError, setCardError] = useState('');

    useEffect(() => {
        createSetupIntent()
            .then((data) => setClientSecret(data.clientSecret))
            .catch((err) => setLoadError(err.message || 'Failed to start card setup.'));
    }, []);

    async function handleSubmit(e) {
        e.preventDefault();
        if (!stripe || !elements || !clientSecret) return;

        setSubmitting(true);
        setCardError('');

        const { error, setupIntent } = await stripe.confirmCardSetup(clientSecret, {
            payment_method: { card: elements.getElement(CardElement), },
        });

        if (error) {
            setCardError(error.message || 'Failed to save card.');
            setSubmitting(false);
            return;
        }

        if (setupIntent.status !== 'succeeded') {
            setCardError('Card could not be saved. Please try again.');
            setSubmitting(false);
            return;
        }

        setSubmitting(false);
        onSuccess();
    }

    if (loadError) {
        return <p className="text-sm text-marquee-marquee">{loadError}</p>;
    }

    if (!clientSecret) {
        return <p className="text-sm text-marquee-muted">Preparing secure card form...</p>;
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-marquee-muted">
                    Card information
                </label>
                <div className="rounded-md border border-marquee-line bg-marquee-panel2 px-4 py-3">
                    <CardElement options={CARD_ELEMENT_OPTIONS} onChange={(e) => setCardError(e.error?.message || '')} />
                </div>
                {cardError && <p className="mt-2 text-xs text-marquee-marquee">{cardError}</p>}
            </div>

            <div className="mt-6 flex justify-end gap-3 pt-4 border-t border-marquee-line">
                <button
                    type="button"
                    onClick={onClose}
                    disabled={submitting}
                    className="rounded-md border border-marquee-line bg-marquee-panel2 px-4 py-2 text-sm font-medium text-marquee-cream hover:bg-marquee-line/40 transition-all disabled:opacity-50"
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    disabled={!stripe || submitting}
                    className="rounded-md bg-marquee-gold px-5 py-2 text-sm font-semibold text-marquee-bg hover:bg-marquee-goldBright transition-all disabled:cursor-not-allowed disabled:opacity-40"
                >
                    {submitting ? 'Saving card...' : 'Save card'}
                </button>
            </div>
        </form>
    );
}

export default function AddPaymentMethodModal({ isOpen, onClose, onAdded }) {
    if (!isOpen) return null;

    function handleSuccess() {
        toast.success('Payment method added successfully.');
        onAdded();
    }

    return (
        <div
            onClick={onClose}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
        >
            <div
                onClick={(e) => e.stopPropagation()}
                className="w-full max-w-lg rounded-xl border border-marquee-line bg-marquee-panel p-6 shadow-2xl"
            >
                <div className="flex items-center justify-between pb-3 border-b border-marquee-line/50">
                    <h2 className="font-display text-2xl text-marquee-goldBright">Add payment method</h2>
                    <button
                        type="button"
                        onClick={onClose}
                        className="flex h-7 w-7 items-center justify-center rounded-lg text-marquee-muted hover:bg-marquee-panel2 hover:text-marquee-cream transition-colors"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>

                <div className="pt-4">
                    {!stripePromise ? (
                        <p className="rounded-md border border-marquee-line bg-marquee-panel2 p-4 text-sm text-marquee-muted">
                            Stripe isn't configured yet. Set <code>VITE_STRIPE_PUBLISHABLE_KEY</code> in the
                            frontend .env file to enable saved payment methods.
                        </p>
                    ) : (
                        <Elements stripe={stripePromise}>
                            <AddCardForm onSuccess={handleSuccess} onClose={onClose} />
                        </Elements>
                    )}
                </div>
            </div>
        </div>
    );
}