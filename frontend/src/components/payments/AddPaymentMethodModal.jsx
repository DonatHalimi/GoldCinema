import {
    CardElement,
    Elements,
    useElements,
    useStripe,
} from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { AnimatePresence, motion } from 'framer-motion';
import {
    CheckCircle2,
    CreditCard,
    LockKeyhole,
    ShieldCheck,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { createSetupIntent } from '../../api/payments';
import Modal from '../ui/modals/Modal';

const stripePromise = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY
    ? loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY)
    : null;

const CARD_ELEMENT_OPTIONS = {
    style: {
        base: {
            color: '#F3ECDD',
            fontFamily: '"Inter", system-ui, sans-serif',
            fontSize: '15px',
            fontWeight: '500',
            lineHeight: '24px',
            '::placeholder': {
                color: '#8F8777',
            },
        },
        invalid: {
            color: '#D46A51',
            iconColor: '#D46A51',
        },
    },
};

function AddCardForm({ onSuccess, onClose }) {
    const stripe = useStripe();
    const elements = useElements();

    const [clientSecret, setClientSecret] = useState(null);
    const [loadError, setLoadError] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [cardError, setCardError] = useState('');
    const [cardComplete, setCardComplete] = useState(false);

    useEffect(() => {
        let mounted = true;

        createSetupIntent()
            .then((data) => {
                if (mounted) {
                    setClientSecret(data.clientSecret);
                }
            })
            .catch((err) => {
                if (mounted) setLoadError(err.message || 'Failed to start secure card setup.');
            });

        return () => {
            mounted = false;
        };
    }, []);

    async function handleSubmit(event) {
        event.preventDefault();

        if (!stripe || !elements || !clientSecret || submitting) return;

        const card = elements.getElement(CardElement);

        if (!card) {
            setCardError('Card information is unavailable.');
            return;
        }

        setSubmitting(true);
        setCardError('');

        try {
            const { error, setupIntent } = await stripe.confirmCardSetup(clientSecret, { payment_method: { card } });

            if (error) {
                setCardError(error.message || 'Failed to save your card.');
                return;
            }

            if (setupIntent.status !== 'succeeded') {
                setCardError('Your card could not be saved. Please try again.');
                return;
            }

            onSuccess();
        } catch (error) {
            setCardError(error.message || 'Something went wrong. Please try again.');
        } finally {
            setSubmitting(false);
        }
    }

    if (loadError) {
        return (
            <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-2xl border border-marquee-marquee/30 bg-marquee-marquee/10 p-4"
            >
                <div className="flex items-start gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-marquee-marquee/10">
                        <ShieldCheck className="h-4 w-4 text-marquee-marquee" />
                    </div>

                    <div>
                        <p className="text-sm font-semibold text-marquee-cream">
                            Unable to initialize secure payment
                        </p>

                        <p className="mt-1 text-xs leading-5 text-marquee-muted">
                            {loadError}
                        </p>
                    </div>
                </div>
            </motion.div>
        );
    }

    if (!clientSecret) {
        return (
            <div className="space-y-5">
                <div className="flex items-center gap-3 rounded-2xl border border-marquee-line bg-marquee-panel2/50 p-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-marquee-gold/10">
                        <LockKeyhole className="h-4 w-4 text-marquee-gold" />
                    </div>

                    <div className="flex-1">
                        <div className="h-3 w-36 animate-pulse rounded-full bg-marquee-line" />
                        <div className="mt-2 h-2.5 w-48 animate-pulse rounded-full bg-marquee-line/70" />
                    </div>
                </div>

                <div className="h-[74px] animate-pulse rounded-2xl border border-marquee-line bg-marquee-panel2/50" />
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit}>
            <div className="space-y-6">
                <div>
                    <div className="mb-2.5 flex items-center justify-between">
                        <label className="text-sm font-semibold text-marquee-cream">
                            Card information
                        </label>

                        <span className="flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-[0.14em] text-marquee-muted">
                            <LockKeyhole className="h-3 w-3" />
                            Secure
                        </span>
                    </div>

                    <motion.div
                        animate={{
                            borderColor: cardError
                                ? 'rgba(185,72,47,0.55)'
                                : cardComplete
                                    ? 'rgba(201,161,90,0.45)'
                                    : 'rgba(255,255,255,0.08)',
                        }}
                        className="group relative overflow-hidden rounded-2xl border bg-marquee-panel2/80 px-4 py-4 transition-colors"
                    >
                        <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-marquee-gold/[0.05] via-transparent to-transparent opacity-0 transition-opacity duration-300 group-focus-within:opacity-100" />

                        <div className="relative flex items-center gap-3">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-marquee-line bg-marquee-panel">
                                <CreditCard className="h-4 w-4 text-marquee-gold" />
                            </div>

                            <div className="min-w-0 flex-1">
                                <CardElement
                                    options={CARD_ELEMENT_OPTIONS}
                                    onChange={(event) => {
                                        setCardError(
                                            event.error?.message || ''
                                        );
                                        setCardComplete(event.complete);
                                    }}
                                />
                            </div>

                            <AnimatePresence>
                                {cardComplete && (
                                    <motion.div
                                        initial={{
                                            opacity: 0,
                                            scale: 0.7,
                                        }}
                                        animate={{
                                            opacity: 1,
                                            scale: 1,
                                        }}
                                        exit={{
                                            opacity: 0,
                                            scale: 0.7,
                                        }}
                                    >
                                        <CheckCircle2 className="h-5 w-5 text-marquee-gold" />
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </motion.div>

                    <AnimatePresence>
                        {cardError && (
                            <motion.p
                                initial={{
                                    opacity: 0,
                                    height: 0,
                                    y: -4,
                                }}
                                animate={{
                                    opacity: 1,
                                    height: 'auto',
                                    y: 0,
                                }}
                                exit={{
                                    opacity: 0,
                                    height: 0,
                                    y: -4,
                                }}
                                className="mt-2 text-xs font-medium text-marquee-marquee"
                            >
                                {cardError}
                            </motion.p>
                        )}
                    </AnimatePresence>
                </div>

                <div className="flex items-start gap-2.5">
                    <LockKeyhole className="mt-0.5 h-3.5 w-3.5 shrink-0 text-marquee-muted" />

                    <p className="text-[11px] leading-4 text-marquee-muted">
                        GoldCinema never stores your full card number or
                        security code. Stripe securely handles sensitive
                        payment information.
                    </p>
                </div>

                <div className="flex items-center justify-end gap-3 border-t border-marquee-line/60 pt-5">
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={submitting}
                        className="rounded-full border border-marquee-line px-5 py-2.5 text-sm font-medium text-marquee-muted transition-all hover:border-marquee-gold/50 hover:bg-marquee-panel2 hover:text-marquee-cream disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        Cancel
                    </button>

                    <button
                        type="submit"
                        disabled={!stripe || !cardComplete || submitting}
                        className="inline-flex min-w-[130px] items-center justify-center gap-2 rounded-full bg-marquee-gold px-5 py-2.5 text-sm font-semibold text-marquee-bg shadow-lg shadow-marquee-gold/10 transition-all hover:bg-marquee-goldBright hover:shadow-marquee-gold/20 disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none"
                    >
                        {submitting ? (
                            <>
                                <span className="h-4 w-4 animate-spin rounded-full border-2 border-marquee-bg/30 border-t-marquee-bg" />
                                Saving...
                            </>
                        ) : (
                            <>
                                <LockKeyhole className="h-3.5 w-3.5" />
                                Save card
                            </>
                        )}
                    </button>
                </div>
            </div>
        </form>
    );
}

export default function AddPaymentMethodModal({
    isOpen,
    onClose,
    onAdded,
}) {
    function handleSuccess() {
        toast.success('Payment method added successfully.');
        onAdded();
    }

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Add Payment Method"
            closeDisabled={false}
        >
            {!stripePromise ? (
                <div className="mt-5 rounded-2xl border border-marquee-line bg-marquee-panel2/70 p-5">
                    <div className="flex items-start gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-marquee-gold/10">
                            <ShieldCheck className="h-4 w-4 text-marquee-gold" />
                        </div>

                        <div>
                            <p className="text-sm font-semibold text-marquee-cream">
                                Stripe isn't configured
                            </p>

                            <p className="mt-1 text-xs leading-5 text-marquee-muted">
                                Set{' '}
                                <code className="rounded-md bg-marquee-bg px-1.5 py-0.5 font-mono text-[10px] text-marquee-gold">
                                    VITE_STRIPE_PUBLISHABLE_KEY
                                </code>{' '}
                                in your frontend environment to enable
                                saved payment methods.
                            </p>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="mt-5">
                    <Elements stripe={stripePromise}>
                        <AddCardForm
                            onSuccess={handleSuccess}
                            onClose={onClose}
                        />
                    </Elements>
                </div>
            )}
        </Modal>
    );
}