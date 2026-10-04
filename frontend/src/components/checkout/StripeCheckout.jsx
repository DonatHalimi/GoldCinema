import { Elements, PaymentElement, useElements, useStripe } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { CreditCard, Lock, Plus, Star } from 'lucide-react';
import { useEffect, useState } from 'react';
import { confirmStripePayment, createStripePaymentIntent } from '../../api/payments';
import AddPaymentMethodModal from '../payments/AddPaymentMethodModal';
import SlideToConfirm from './SlideToConfirm';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

const BRAND_LABELS = {
  visa: 'Visa',
  mastercard: 'Mastercard',
  amex: 'American Express',
  discover: 'Discover',
  diners: 'Diners Club',
  jcb: 'JCB',
  unionpay: 'UnionPay',
};

const formatMoney = (amount, currency = 'USD') =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(Number(amount || 0));

function formatBrand(brand) {
  return BRAND_LABELS[brand] || (brand ? brand.charAt(0).toUpperCase() + brand.slice(1) : 'Card');
}

function Row({ label, value }) {
  return (
    <div className="flex items-center justify-between py-2 text-sm">
      <dt className="text-marquee-muted">{label}</dt>
      <dd className="text-marquee-cream">{value}</dd>
    </div>
  );
}

function OrderSummary({ order, paymentLabel }) {
  const currency = order.currency || 'USD';
  const ticketCount = order.seats?.length || 0;
  const total = formatMoney(order.totalAmount, currency);

  return (
    <dl className="divide-y divide-marquee-line/60 rounded-xl border border-marquee-line bg-marquee-panel2 px-4">
      <Row label={`Seats (${ticketCount})`} value={order.seats?.join(', ')} />
      <Row label="Tickets" value={formatMoney(order.ticketAmount, currency)} />
      {order.snackAmount > 0 && <Row label="Snacks" value={formatMoney(order.snackAmount, currency)} />}
      {order.giftCardAmount > 0 && (
        <Row label={`Gift card ${order.giftCardCode || ''}`} value={`−${formatMoney(order.giftCardAmount, currency)}`} />
      )}
      <Row label="Pay with" value={paymentLabel} />
      <div className="flex items-center justify-between py-3">
        <dt className="text-sm font-semibold text-marquee-cream">Total</dt>
        <dd className="font-display text-2xl tracking-wide text-marquee-gold">{total}</dd>
      </div>
    </dl>
  );
}

function SavedPaymentMethods({
  methods,
  selectedPaymentMethod,
  setSelectedPaymentMethod,
  paymentMethodsLoading,
  onPaymentMethodAdded,
}) {
  const [isAddOpen, setIsAddOpen] = useState(false);

  if (paymentMethodsLoading) {
    return (
      <div className="mb-6 rounded-lg border border-marquee-line bg-marquee-panel2 p-4">
        <p className="text-sm text-marquee-muted">Loading saved payment methods...</p>
      </div>
    );
  }

  if (!methods.length) {
    return (
      <div className="mb-6 rounded-xl border border-dashed border-marquee-line bg-marquee-panel2 p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-marquee-cream">No saved payment methods</p>
            <p className="mt-1 text-xs text-marquee-muted">
              You can enter a new card below or save a card for faster checkout next time
            </p>
          </div>

          <button
            type="button"
            onClick={() => setIsAddOpen(true)}
            className="flex shrink-0 items-center gap-2 rounded-full bg-marquee-gold px-4 py-2 text-xs font-semibold text-marquee-bg transition hover:bg-marquee-goldBright"
          >
            <Plus className="h-4 w-4" />
            Add card
          </button>
        </div>

        <AddPaymentMethodModal
          isOpen={isAddOpen}
          onClose={() => setIsAddOpen(false)}
          onAdded={() => {
            setIsAddOpen(false);
            onPaymentMethodAdded?.();
          }}
        />
      </div>
    );
  }

  return (
    <div className="mb-6 space-y-3">
      <div>
        <p className="text-sm font-semibold text-marquee-cream">Saved payment methods</p>
        <p className="mt-1 text-xs text-marquee-muted">Select a saved card or use a new card below</p>
      </div>

      {methods.map((method) => {
        const selected = selectedPaymentMethod === method.id;

        return (
          <button
            key={method.id}
            type="button"
            onClick={() => setSelectedPaymentMethod(method.id)}
            className={`w-full rounded-xl border p-4 text-left transition ${selected
              ? 'border-marquee-gold bg-marquee-gold/10'
              : 'border-marquee-line bg-marquee-panel2 hover:border-marquee-gold/40'
              }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <CreditCard className="h-5 w-5 text-marquee-goldDim" />

                <div>
                  <p className="font-semibold text-marquee-cream">
                    {formatBrand(method.brand)} •••• {method.last4}
                  </p>
                  <p className="mt-1 text-xs text-marquee-muted">
                    Expires {String(method.expMonth).padStart(2, '0')}/{String(method.expYear).slice(-2)}
                  </p>
                </div>
              </div>

              {method.isDefault && (
                <span className="flex items-center gap-1 rounded-full border border-marquee-gold/40 bg-marquee-gold/10 px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-marquee-gold">
                  <Star className="h-3 w-3 fill-current" />
                  Default
                </span>
              )}
            </div>

            <div className="mt-3 flex items-center gap-2">
              <span
                className={`h-4 w-4 rounded-full border flex items-center justify-center ${selected ? 'border-marquee-gold' : 'border-marquee-line'
                  }`}
              >
                {selected && <span className="h-2 w-2 rounded-full bg-marquee-gold" />}
              </span>

              <span className="text-xs text-marquee-muted">
                {selected ? 'Selected payment method' : 'Use this card'}
              </span>
            </div>
          </button>
        );
      })}

      <button
        type="button"
        onClick={() => setSelectedPaymentMethod(null)}
        className={`w-full rounded-xl border p-4 text-left transition ${selectedPaymentMethod === null
          ? 'border-marquee-gold bg-marquee-gold/10'
          : 'border-marquee-line bg-marquee-panel2 hover:border-marquee-gold/40'
          }`}
      >
        <div className="flex items-center gap-3">
          <CreditCard className="h-5 w-5 text-marquee-goldDim" />

          <div>
            <p className="font-semibold text-marquee-cream">Use a new card</p>
            <p className="mt-1 text-xs text-marquee-muted">
              Enter your card details securely with Stripe.
            </p>
          </div>
        </div>
      </button>
    </div>
  );
}

function StripeForm({
  order,
  onSuccess,
  onError,
  selectedPaymentMethod,
  clientSecret,
  confirmPaymentFn,
  paymentLabel,
}) {
  const stripe = useStripe();
  const elements = useElements();
  const [submitting, setSubmitting] = useState(false);
  const [paymentComplete, setPaymentComplete] = useState(false);

  useEffect(() => {
    setPaymentComplete(false);
  }, [selectedPaymentMethod]);

  async function confirmOrder(paymentIntent) {
    try {
      const data = await confirmPaymentFn(order, paymentIntent);
      onSuccess(data.order ?? data.giftCard);
    } catch (err) {
      onError(err.response?.data?.error || err.message || 'Payment confirmation failed.');
    } finally {
      setSubmitting(false);
    }
  }

  async function confirmSavedCard() {
    const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
      payment_method: selectedPaymentMethod,
    });

    if (error) {
      onError(error.message || 'Payment failed. Please try again.');
      setSubmitting(false);
      return;
    }

    if (!paymentIntent) {
      onError('No payment intent returned.');
      setSubmitting(false);
      return;
    }

    await confirmOrder(paymentIntent);
  }

  async function confirmNewCard() {
    if (!elements) {
      onError('Payment form is not ready.');
      setSubmitting(false);
      return;
    }

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

    await confirmOrder(paymentIntent);
  }

  const currency = order.currency || 'USD';
  const total = formatMoney(order.totalAmount, currency);
  const canPay = Boolean(selectedPaymentMethod) || paymentComplete;
  const ready = Boolean(stripe && elements) && canPay && !submitting;

  async function handleConfirmedPay() {
    if (submitting) return;
    onError('');
    setSubmitting(true);

    try {
      if (selectedPaymentMethod) await confirmSavedCard();
      else await confirmNewCard();
    } catch (err) {
      onError(err.message || 'Payment failed. Please try again.');
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-6">
      {!selectedPaymentMethod && (
        <PaymentElement onChange={(e) => setPaymentComplete(e.complete)} />
      )}

      <OrderSummary order={order} paymentLabel={paymentLabel} />

      <SlideToConfirm
        label="Slide to pay"
        ariaLabel={`Confirm payment of ${total}. Drag right, or press Enter.`}
        price={total}
        onConfirm={handleConfirmedPay}
        loading={!ready}
      />

      <p className="flex items-center justify-center gap-1.5 text-xs text-marquee-muted">
        <Lock className="h-3 w-3 text-marquee-gold" /> Payments are processed securely by Stripe and PayPal
      </p>
    </div>
  );
}

export default function StripeCheckout({
  order,
  onSuccess,
  onError,
  paymentMethods = [],
  paymentMethodsLoading = false,
  onPaymentMethodAdded,
  createIntentFn = createStripePaymentIntent,
  confirmPaymentFn = confirmStripePayment,
}) {
  const [clientSecret, setClientSecret] = useState(null);
  const [loadError, setLoadError] = useState('');
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(null);

  useEffect(() => {
    if (!paymentMethods.length) {
      setSelectedPaymentMethod(null);
      return;
    }

    const defaultMethod = paymentMethods.find((method) => method.isDefault);
    setSelectedPaymentMethod(defaultMethod?.id || paymentMethods[0]?.id || null);
  }, [paymentMethods]);

  useEffect(() => {
    if (!order?._id) return;

    let cancelled = false;

    async function createPaymentIntent() {
      setClientSecret(null);
      setLoadError('');

      try {
        const data = await createIntentFn({
          orderId: order._id,
          paymentMethodId: selectedPaymentMethod,
        });

        if (!data?.clientSecret) throw new Error('Stripe client secret was not returned.');
        if (!cancelled) setClientSecret(data.clientSecret);
      } catch (err) {
        if (!cancelled) {
          setLoadError(err.response?.data?.error || err.message || 'Failed to create payment');
        }
      }
    }

    createPaymentIntent();

    return () => {
      cancelled = true;
    };
  }, [order?._id, selectedPaymentMethod, createIntentFn]);

  if (!stripePromise) {
    return (
      <p className="rounded-md border border-marquee-line bg-marquee-panel2 p-4 text-sm text-marquee-muted">
        Stripe isn't configured yet. Set <code>VITE_STRIPE_PUBLISHABLE_KEY</code> in the frontend .env
        file to enable card payments.
      </p>
    );
  }

  if (loadError) {
    return <p className="text-sm text-marquee-marquee">{loadError}</p>;
  }

  if (!clientSecret) {
    return <p className="text-sm text-marquee-muted">Preparing secure payment form...</p>;
  }

  const selectedMethod = paymentMethods.find((m) => m.id === selectedPaymentMethod);
  const paymentLabel = selectedMethod
    ? `${formatBrand(selectedMethod.brand)} •••• ${selectedMethod.last4}`
    : 'New card';

  return (
    <>
      <SavedPaymentMethods
        methods={paymentMethods}
        selectedPaymentMethod={selectedPaymentMethod}
        setSelectedPaymentMethod={setSelectedPaymentMethod}
        paymentMethodsLoading={paymentMethodsLoading}
        onPaymentMethodAdded={onPaymentMethodAdded}
      />

      <Elements
        stripe={stripePromise}
        options={{
          clientSecret,
          appearance: {
            theme: 'night',
            variables: {
              colorPrimary: '#C6A15B',
            },
          },
        }}
      >
        <StripeForm
          order={order}
          onSuccess={onSuccess}
          onError={onError}
          selectedPaymentMethod={selectedPaymentMethod}
          clientSecret={clientSecret}
          confirmPaymentFn={confirmPaymentFn}
          paymentLabel={paymentLabel}
        />
      </Elements>
    </>
  );
}