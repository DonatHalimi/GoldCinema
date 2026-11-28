import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
    useCaptureGiftCardPaypalOrderMutation,
    useConfirmGiftCardPaymentMutation,
    useCreateGiftCardMutation,
    useCreateGiftCardPaymentIntentMutation,
    useCreateGiftCardPaypalOrderMutation,
    useGetPaymentMethodsQuery,
} from '../store/api/paymentsApiSlice';

import PaymentSection from '../components/checkout/PaymentSelection';
import AmountPicker from '../components/giftcards/AmountPicker';
import BackgroundTemplatePicker, { TEMPLATES } from '../components/giftcards/BackgroundTemplatePicker';
import { useAuth } from '../context/AuthContext';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function BuyGiftCard() {
    const { t } = useTranslation('giftCards');
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
    const { data: paymentMethods = [], isLoading: paymentMethodsLoading } = useGetPaymentMethodsQuery(undefined, { skip: !user });
    const [createGiftCardRequest] = useCreateGiftCardMutation();
    const [createIntentRequest] = useCreateGiftCardPaymentIntentMutation();
    const [confirmPaymentRequest] = useConfirmGiftCardPaymentMutation();
    const [createPaypalOrderRequest] = useCreateGiftCardPaypalOrderMutation();
    const [capturePaypalOrderRequest] = useCaptureGiftCardPaypalOrderMutation();

    useEffect(() => {
        if (!user) return;

        setSenderName(user.name || '');
        setSenderEmail(user.email || '');
    }, [user]);

    const createGiftCardIntentAdapter = (request = {}) =>
        createIntentRequest({
            giftCardId: giftCard._id,
            paymentMethodId: request.paymentMethodId,
        }).unwrap();
    const confirmGiftCardPaymentAdapter = (currentGiftCard, paymentIntent) =>
        confirmPaymentRequest({ giftCard: currentGiftCard, paymentIntent }).unwrap();
    const createGiftCardPaypalOrderAdapter = () =>
        createPaypalOrderRequest(giftCard).unwrap();
    const captureGiftCardPaypalOrderAdapter = (_giftCardId, orderID) =>
        capturePaypalOrderRequest({ giftCard, orderID }).unwrap();

    function validate() {
        const errors = {};
        const numericAmount = Number(amount);

        if (!Number.isFinite(numericAmount) || numericAmount < 5 || numericAmount > 500) {
            errors.amount = t('buy.errors.amountRange');
        }

        if (!template) errors.template = t('buy.errors.templateRequired');
        if (!senderName.trim()) errors.senderName = t('buy.errors.senderNameRequired');
        if (!EMAIL_RE.test(senderEmail)) errors.senderEmail = t('buy.errors.senderEmailInvalid');
        if (!recipientName.trim()) errors.recipientName = t('buy.errors.recipientNameRequired');
        if (!EMAIL_RE.test(recipientEmail)) errors.recipientEmail = t('buy.errors.recipientEmailInvalid');
        if (message.length > 500) errors.message = t('buy.errors.messageTooLong');

        return errors;
    }

    async function handleSubmit(e) {
        e.preventDefault();
        setFormError('');

        const errors = validate();
        setFieldErrors(errors);
        if (Object.keys(errors).length > 0) return;

        setSubmitting(true);
        try {
            const data = await createGiftCardRequest({
                amount: Number(amount),
                backgroundTemplate: template,
                senderName: senderName.trim(),
                senderEmail: senderEmail.trim().toLowerCase(),
                recipientName: recipientName.trim(),
                recipientEmail: recipientEmail.trim().toLowerCase(),
                message: message.trim() || undefined,
            }).unwrap();

            setGiftCard(data.giftCard);
            setStep('payment');
        } catch (err) {
            setFormError(
                err.data?.error || err.message || t('buy.errors.startFailed')
            );
        } finally {
            setSubmitting(false);
        }
    }

    function handlePaymentSuccess(paidGiftCard) {
        setGiftCard(paidGiftCard);
        setStep('done');
    }

    const formattedAmount = (value) =>
        `$${Number(value || 0).toFixed(2)}`;

    if (step === 'done' && giftCard) {
        return (
            <div className="mx-auto max-w-lg px-6 py-16 text-center">
                <p className="font-display text-4xl tracking-wide text-marquee-goldBright">
                    {t('buy.done.heading')}
                </p>
                <p className="mt-3 text-marquee-muted">
                    {t('buy.done.description', {
                        amount: formattedAmount(giftCard.initialValue),
                        email: giftCard.recipientEmail,
                    })}
                </p>
                <div className="mt-8 rounded-xl border border-marquee-line bg-marquee-panel p-6">
                    <p className="text-xs uppercase tracking-widest text-marquee-goldDim">
                        {t('buy.done.codeLabel')}
                    </p>
                    <p className="mt-2 font-mono text-2xl tracking-widest text-marquee-cream">
                        {giftCard.code}
                    </p>
                    <p className="mt-3 text-xs text-marquee-muted">
                        {t('buy.done.codeNote')}
                    </p>
                </div>
            </div>
        );
    }

    if (step === 'payment' && giftCard) {
        return (
            <div className="mx-auto max-w-2xl px-6 py-12">
                <h1 className="mb-2 text-center font-serif text-3xl font-bold text-marquee-cream">
                    {t('buy.payment.title')}
                </h1>
                <p className="mb-8 text-center text-marquee-muted">
                    {t('buy.payment.subtitle', {
                        amount: formattedAmount(giftCard.initialValue),
                        name: giftCard.recipientName,
                    })}
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
                    confirmPaymentFn={confirmGiftCardPaymentAdapter}
                    createPaypalOrderFn={createGiftCardPaypalOrderAdapter}
                    capturePaypalOrderFn={captureGiftCardPaypalOrderAdapter}
                />
            </div>
        );
    }

    return (
        <div className="mx-auto mt-20 max-w-2xl px-6">
            <form onSubmit={handleSubmit} className="space-y-8 rounded-xl border border-marquee-line bg-marquee-panel p-6">
                <div className='space-y-4'>
                    <h1 className="text-center font-serif text-3xl font-bold text-marquee-cream">
                        {t('buy.form.title')}
                    </h1>
                    <p className="text-center text-marquee-muted">
                        {t('buy.form.subtitle')}
                    </p>
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
                        label={t('buy.form.senderNameLabel')}
                        value={senderName}
                        onChange={setSenderName}
                        error={fieldErrors.senderName}
                    />

                    <TextField
                        label={t('buy.form.senderEmailLabel')}
                        type="email"
                        value={senderEmail}
                        onChange={setSenderEmail}
                        error={fieldErrors.senderEmail}
                    />

                    <TextField
                        label={t('buy.form.recipientNameLabel')}
                        value={recipientName}
                        onChange={setRecipientName}
                        error={fieldErrors.recipientName}
                    />

                    <TextField
                        label={t('buy.form.recipientEmailLabel')}
                        type="email"
                        value={recipientEmail}
                        onChange={setRecipientEmail}
                        error={fieldErrors.recipientEmail}
                    />
                </div>

                <div>
                    <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-marquee-muted">
                        {t('buy.form.messageLabel')}
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
                    {submitting
                        ? t('buy.form.submitPreparing')
                        : t('buy.form.submitContinue', {
                            amount: formattedAmount(amount),
                        })}
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