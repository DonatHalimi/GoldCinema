import {
    Elements,
    PaymentElement,
    useElements,
    useStripe,
} from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { CreditCard } from 'lucide-react';
import { useEffect, useState } from 'react';
import { confirmStripePayment, createStripePaymentIntent, getPaymentMethods } from '../../api/payments';

const stripePromise = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY
    ? loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY)
    : null;


function SavedCardList({ savedMethods, selectedId, onSelect, onUseNewCard }) {
    return (
        <div className="space-y-2">
            {savedMethods.map((pm) => (
                <button
                    key={pm.id}
                    type="button"
                    onClick={() => onSelect(pm.id)}
                    className={`flex w-full items-center justify-between rounded-md border px-4 py-3 text-left transition ${selectedId === pm.id
                        ? 'border-marquee-gold bg-marquee-panel2'
                        : 'border-marquee-line bg-marquee-panel2/60 hover:border-marquee-line/80'
                        }`}
                >
                    <span className="flex items-center gap-3">
                        <CreditCard className="h-4 w-4 text-marquee-goldDim" />
                        <span className="text-sm text-marquee-cream">
                            {pm.brand ? pm.brand.charAt(0).toUpperCase() + pm.brand.slice(1) : 'Card'} •••• {pm.last4}
                        </span>
                    </span>
                    <span className="text-xs text-marquee-muted">
                        Expires {String(pm.expMonth).padStart(2, '0')}/{String(pm.expYear).slice(-2)}
                    </span>
                </button>
            ))}

            <button
                type="button"
                onClick={onUseNewCard}
                className={`w-full rounded-md border px-4 py-3 text-left text-sm transition ${selectedId === null
                    ? 'border-marquee-gold bg-marquee-panel2 text-marquee-cream'
                    : 'border-dashed border-marquee-line text-marquee-muted hover:border-marquee-line/80'
                    }`}
            >
                + Use a new card
            </button>
        </div>
    );
}

function StripeForm({ order, savedMethods, onSuccess, onError }) {
    const stripe = useStripe();
    const elements = useElements();

    const defaultSaved = savedMethods.find((pm) => pm.isDefault) || savedMethods[0] || null;
    const [selectedId, setSelectedId] = useState(defaultSaved?.id || null);
    const [submitting, setSubmitting] = useState(false);

    async function confirmOrderOnBackend(paymentIntent) {
        const { data } = await confirmStripePayment(order, paymentIntent);
        onSuccess(data.order);
    }

    async function handleSavedCardSubmit(e) {
        e.preventDefault();
        if (!stripe || !selectedId) return;

        setSubmitting(true);
        onError('');

        const { error, paymentIntent } = await stripe.confirmCardPayment(order.clientSecret, {
            payment_method: selectedId,
        });

        if (error) {
            onError(error.message || 'Payment failed. Please check your card details.');
            setSubmitting(false);
            return;
        }

        try {
            await confirmOrderOnBackend(paymentIntent);
        } catch (err) {
            console.error('STRIPE CONFIRM ERROR:', err);
            onError(err.response?.data?.error || err.message || 'Payment confirmation failed.');
        } finally {
            setSubmitting(false);
        }
    }

    async function handleNewCardSubmit(e) {
        e.preventDefault();
        if (!stripe || !elements) return;

        setSubmitting(true);
        onError('');

        const { error: submitError, paymentIntent } = await stripe.confirmPayment({
            elements,
            redirect: 'if_required',
        });

        if (submitError) {
            onError(submitError.message || 'Payment failed. Please check your card details.');
            setSubmitting(false);
            return;
        }

        if (!paymentIntent) {
            onError('No payment intent returned.');
            setSubmitting(false);
            return;
        }

        try {
            await confirmOrderOnBackend(paymentIntent);
        } catch (err) {
            console.error('STRIPE CONFIRM ERROR:', err);
            onError(err.response?.data?.error || err.message || 'Payment confirmation failed.');
        } finally {
            setSubmitting(false);
        }
    }

    const usingSavedCard = selectedId !== null;

    return (
        <form onSubmit={usingSavedCard ? handleSavedCardSubmit : handleNewCardSubmit} className="space-y-6">
            {savedMethods.length > 0 && (
                <div>
                    <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-marquee-muted">
                        Saved payment methods
                    </label>
                    <SavedCardList
                        savedMethods={savedMethods}
                        selectedId={selectedId}
                        onSelect={setSelectedId}
                        onUseNewCard={() => setSelectedId(null)}
                    />
                </div>
            )}

            {!usingSavedCard && <PaymentElement />}

            <button
                type="submit"
                disabled={!stripe || submitting || (usingSavedCard ? false : !elements)}
                className="w-full rounded-full bg-marquee-gold px-6 py-3 font-semibold text-marquee-bg transition hover:bg-marquee-goldBright disabled:cursor-not-allowed disabled:opacity-40"
            >
                {submitting ? 'Processing payment...' : `Pay $${order.totalAmount.toFixed(2)} with card`}
            </button>
        </form>
    );
}

export default function StripeCheckout({
    order,
    onSuccess,
    onError,
    onReady
}) {
    const [clientSecret, setClientSecret] = useState(null);
    const [loadError, setLoadError] = useState('');
    const [savedMethods, setSavedMethods] = useState([]);

    useEffect(() => {
        if (!order?._id) return;

        createStripePaymentIntent({ orderId: order._id })
            .then(({ data }) => {
                setClientSecret(data.clientSecret);
            })
            .catch((err) => {
                setLoadError(err.response?.data?.error || err.message || 'Failed to create payment');
            });

        getPaymentMethods()
            .then((data) => setSavedMethods(data.paymentMethods || []))
            .catch(() => setSavedMethods([]));
    }, [order?._id]);

    if (!stripePromise) {
        return (
            <p className="rounded-md border border-marquee-line bg-marquee-panel2 p-4 text-sm text-marquee-muted">
                Stripe isn't configured yet. Set{' '}
                <code>VITE_STRIPE_PUBLISHABLE_KEY</code>{' '}
                in the frontend .env file to enable card payments.
            </p>
        );
    }

    if (loadError) {
        return (
            <p className="text-sm text-marquee-marquee">
                {loadError}
            </p>
        );
    }

    if (!clientSecret) {
        return (
            <p className="text-sm text-marquee-muted">
                Preparing secure payment form...
            </p>
        );
    }

    return (
        <Elements
            stripe={stripePromise}
            options={{
                clientSecret,
                appearance: {
                    theme: 'night',
                    variables: {
                        colorPrimary: '#C6A15B'
                    }
                }
            }}
        >
            <StripeForm
                order={{ ...order, clientSecret }}
                savedMethods={savedMethods}
                onSuccess={onSuccess}
                onError={onError}
                onReady={onReady}
            />
        </Elements>
    );
}