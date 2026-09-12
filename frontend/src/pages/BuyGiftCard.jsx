import { useEffect, useState } from 'react';

import {
    captureGiftCardPaypalOrder,
    confirmGiftCardPayment,
    createGiftCard,
    createGiftCardPaymentIntent,
    createGiftCardPaypalOrder,
} from '../api/giftCard';

import { getPaymentMethods } from '../api/payments';

import PaymentSection from '../components/checkout/PaymentSelection';
import AmountPicker from '../components/giftcards/AmountPicker';
import BackgroundTemplatePicker, { TEMPLATES } from '../components/giftcards/BackgroundTemplatePicker';
import { useAuth } from '../context/AuthContext';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function BuyGiftCard() {
    const { user } = useAuth();

    const [step, setStep] = useState('form');
    const [amount, setAmount] = useState(50);
    const [template, setTemplate] = useState(TEMPLATES[0].id);
    const [senderName, setSenderName] = useState('');
    const [senderEmail, setSenderEmail] = useState('');
    const [recipientName, setRecipientName] = useState('');
    const [recipientEmail, setRecipientEmail] = useState('');
    const [message, setMessage] = useState('');

    const [fieldErrors, setFieldErrors] = useState({});
    const [formError, setFormError] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const [giftCard, setGiftCard] = useState(null);
    const [provider, setProvider] = useState('stripe');
    const [payError, setPayError] = useState('');
    const [paymentMethods, setPaymentMethods] = useState([]);
    const [paymentMethodsLoading, setPaymentMethodsLoading] = useState(true);

    useEffect(() => {
        if (!user) return;

        setSenderName(user.name || '');
        setSenderEmail(user.email || '');
    }, [user]);

    const createGiftCardIntentAdapter = (request = {}) =>
        createGiftCardPaymentIntent({
            giftCardId: giftCard._id,
            paymentMethodId: request.paymentMethodId,
        });

    function validate() {
        const errors = {};
        const numericAmount = Number(amount);

        if (!Number.isFinite(numericAmount) || numericAmount < 5 || numericAmount > 500) errors.amount = 'Enter an amount between $5 and $500.';

        if (!template) errors.template = 'Please choose a design.';
        if (!senderName.trim()) errors.senderName = 'Your name is required.';
        if (!EMAIL_RE.test(senderEmail)) errors.senderEmail = 'Enter a valid email.';
        if (!recipientName.trim()) errors.recipientName = "Recipient's name is required.";
        if (!EMAIL_RE.test(recipientEmail)) errors.recipientEmail = 'Enter a valid recipient email.';
        if (message.length > 500) errors.message = 'Message must be 500 characters or fewer.';

        return errors;
    }

    useEffect(() => {
        async function loadPaymentMethods() {
            try {
                setPaymentMethodsLoading(true);

                const data = await getPaymentMethods();

                setPaymentMethods(data.paymentMethods || []);
            } catch (err) {
                console.error('PAYMENT METHODS LOAD ERROR:', err);

                setPaymentMethods([]);
            } finally {
                setPaymentMethodsLoading(false);
            }
        }

        loadPaymentMethods();
    }, []);

    async function handleSubmit(e) {
        e.preventDefault();
        setFormError('');

        const errors = validate();
        setFieldErrors(errors);
        if (Object.keys(errors).length > 0) return;

        setSubmitting(true);
        try {
            const data = await createGiftCard({
                amount: Number(amount),
                backgroundTemplate: template,
                senderName: senderName.trim(),
                senderEmail: senderEmail.trim().toLowerCase(),
                recipientName: recipientName.trim(),
                recipientEmail: recipientEmail.trim().toLowerCase(),
                message: message.trim() || undefined,
            });

            setGiftCard(data.giftCard);
            setStep('payment');
        } catch (err) {
            setFormError(err.response?.data?.error || err.message || 'Failed to start gift card purchase.');
        } finally {
            setSubmitting(false);
        }
    }

    function handlePaymentSuccess(paidGiftCard) {
        setGiftCard(paidGiftCard);
        setStep('done');
    }

    if (step === 'done' && giftCard) {
        return (
            <div className="mx-auto max-w-lg px-6 py-16 text-center">
                <p className="font-display text-4xl tracking-wide text-marquee-goldBright">GIFT SENT 🎁</p>
                <p className="mt-3 text-marquee-muted">
                    Your ${giftCard.initialValue.toFixed(2)} gift card has been emailed to {giftCard.recipientEmail}.
                </p>
                <div className="mt-8 rounded-xl border border-marquee-line bg-marquee-panel p-6">
                    <p className="text-xs uppercase tracking-widest text-marquee-goldDim">Gift card code</p>
                    <p className="mt-2 font-mono text-2xl tracking-widest text-marquee-cream">{giftCard.code}</p>
                    <p className="mt-3 text-xs text-marquee-muted">Keep this for your records in case the email doesn't arrive.</p>
                </div>
            </div>
        );
    }

    if (step === 'payment' && giftCard) {
        return (
            <div className="mx-auto max-w-2xl px-6 py-12">
                <h1 className="mb-2 text-center font-serif text-3xl font-bold text-marquee-cream">Complete your purchase</h1>
                <p className="mb-8 text-center text-marquee-muted">
                    ${giftCard.initialValue.toFixed(2)} gift card for {giftCard.recipientName}
                </p>

                <PaymentSection
                    provider={provider}
                    setProvider={setProvider}
                    order={{
                        _id: giftCard._id,
                        totalAmount: giftCard.initialValue,
                        currency: giftCard.currency,
                    }}
                    onSuccess={handlePaymentSuccess}
                    onError={setPayError}
                    payError={payError}
                    paymentMethods={paymentMethods}
                    paymentMethodsLoading={paymentMethodsLoading}
                    createIntentFn={createGiftCardIntentAdapter}
                    confirmPaymentFn={confirmGiftCardPayment}
                    createPaypalOrderFn={createGiftCardPaypalOrder}
                    capturePaypalOrderFn={captureGiftCardPaypalOrder}
                />
            </div>
        );
    }

    return (
        <div className="mx-auto mt-20 max-w-2xl px-6">
            <form onSubmit={handleSubmit} className="space-y-8 rounded-xl border border-marquee-line bg-marquee-panel p-6">
                <div className='space-y-4'>
                    <h1 className="text-center font-serif text-3xl font-bold text-marquee-cream">Give the gift of movies</h1>
                    <p className="text-center text-marquee-muted">Send a GoldCinema gift card to anyone, instantly.</p>
                </div>

                <AmountPicker
                    value={amount}
                    onChange={setAmount}
                    error={fieldErrors.amount}
                />

                <BackgroundTemplatePicker
                    value={template}
                    onChange={setTemplate}
                    error={fieldErrors.template}
                />

                <div className="grid gap-4 sm:grid-cols-2">
                    <TextField
                        label="Your name *"
                        value={senderName}
                        onChange={setSenderName}
                        error={fieldErrors.senderName}
                    />

                    <TextField
                        label="Your email *"
                        type="email"
                        value={senderEmail}
                        onChange={setSenderEmail}
                        error={fieldErrors.senderEmail}
                    />

                    <TextField
                        label="Recipient's name *"
                        value={recipientName}
                        onChange={setRecipientName}
                        error={fieldErrors.recipientName}
                    />

                    <TextField
                        label="Recipient's email *"
                        type="email"
                        value={recipientEmail}
                        onChange={setRecipientEmail}
                        error={fieldErrors.recipientEmail}
                    />
                </div>

                <div>
                    <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-marquee-muted">
                        Personal message
                    </label>

                    <textarea
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        rows={3}
                        maxLength={500}
                        className="w-full rounded-md border border-marquee-line bg-marquee-panel2 px-4 py-2.5 text-marquee-cream outline-none transition focus:border-marquee-gold"
                    />

                    {fieldErrors.message && (
                        <p className="mt-1 text-xs text-marquee-marquee">
                            {fieldErrors.message}
                        </p>
                    )}
                </div>

                {formError && <p className="text-sm text-marquee-marquee">{formError}</p>}

                <button
                    type="submit"
                    disabled={submitting}
                    className="w-full rounded-full bg-marquee-gold px-6 py-3 font-semibold text-marquee-bg transition hover:bg-marquee-goldBright disabled:opacity-40"
                >
                    {submitting ? 'Preparing checkout...' : `Continue to payment — $${Number(amount || 0).toFixed(2)}`}
                </button>
            </form>
        </div>
    );
}

function TextField({ label, type = 'text', value, onChange, error }) {
    return (
        <label className="block">
            <span className="mb-1 block text-xs font-semibold uppercase tracking-wider text-marquee-muted">{label}</span>
            <input
                type={type}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="w-full rounded-md border border-marquee-line bg-marquee-panel2 px-4 py-2.5 text-marquee-cream outline-none transition focus:border-marquee-gold"
            />
            {error && <span className="mt-1 block text-xs text-marquee-marquee">{error}</span>}
        </label>
    );
}