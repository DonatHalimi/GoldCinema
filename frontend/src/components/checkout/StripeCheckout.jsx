import {
  Elements,
  PaymentElement,
  useElements,
  useStripe,
} from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { CreditCard, Star } from 'lucide-react';
import { useEffect, useState } from 'react';
import api from '../../api/client';
import { Plus } from 'lucide-react';
import AddPaymentMethodModal from '../payments/AddPaymentMethodModal';

const stripePromise = loadStripe(
  import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY
);

const BRAND_LABELS = {
  visa: 'Visa',
  mastercard: 'Mastercard',
  amex: 'American Express',
  discover: 'Discover',
  diners: 'Diners Club',
  jcb: 'JCB',
  unionpay: 'UnionPay',
};

function formatBrand(brand) {
  return (
    BRAND_LABELS[brand] ||
    (brand
      ? brand.charAt(0).toUpperCase() + brand.slice(1)
      : 'Card')
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
        <p className="text-sm text-marquee-muted">
          Loading saved payment methods...
        </p>
      </div>
    );
  }

  if (!methods.length) {
    return (
      <div className="mb-6 rounded-xl border border-dashed border-marquee-line bg-marquee-panel2 p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-marquee-cream">
              No saved payment methods
            </p>

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
        <p className="text-sm font-semibold text-marquee-cream">
          Saved payment methods
        </p>

        <p className="mt-1 text-xs text-marquee-muted">
          Select a saved card or use a new card below
        </p>
      </div>

      {methods.map((method) => {
        const selected =
          selectedPaymentMethod === method.id;

        return (
          <button
            key={method.id}
            type="button"
            onClick={() =>
              setSelectedPaymentMethod(method.id)
            }
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
                    {formatBrand(method.brand)}{' '}
                    •••• {method.last4}
                  </p>

                  <p className="mt-1 text-xs text-marquee-muted">
                    Expires{' '}
                    {String(method.expMonth).padStart(
                      2,
                      '0'
                    )}
                    /
                    {String(method.expYear).slice(-2)}
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
                className={`h-4 w-4 rounded-full border flex items-center justify-center ${selected
                  ? 'border-marquee-gold'
                  : 'border-marquee-line'
                  }`}
              >
                {selected && (
                  <span className="h-2 w-2 rounded-full bg-marquee-gold" />
                )}
              </span>

              <span className="text-xs text-marquee-muted">
                {selected
                  ? 'Selected payment method'
                  : 'Use this card'}
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
            <p className="font-semibold text-marquee-cream">
              Use a new card
            </p>

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
}) {
  const stripe = useStripe();
  const elements = useElements();

  const [submitting, setSubmitting] = useState(false);

  async function confirmSavedCard() {
    const { error, paymentIntent } =
      await stripe.confirmCardPayment(clientSecret, {
        payment_method: selectedPaymentMethod,
      });

    if (error) {
      onError(
        error.message ||
        'Payment failed. Please try again.'
      );

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

    const {
      error: submitError,
      paymentIntent,
    } = await stripe.confirmPayment({
      elements,
      redirect: 'if_required',
    });

    if (submitError) {
      onError(
        submitError.message ||
        'Payment failed. Please check your card details.'
      );

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

  async function confirmOrder(paymentIntent) {
    try {
      const { data } = await api.post(
        '/payments/stripe/confirm',
        {
          orderId: order._id,
          paymentIntentId: paymentIntent.id,
        }
      );

      onSuccess(data.order);
    } catch (err) {
      onError(
        err.response?.data?.error ||
        err.message ||
        'Payment confirmation failed.'
      );
    } finally {
      setSubmitting(false);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setSubmitting(true);
    onError('');

    try {
      if (selectedPaymentMethod) {
        await confirmSavedCard();
      } else {
        await confirmNewCard();
      }
    } catch (err) {
      onError(
        err.message ||
        'Payment failed. Please try again.'
      );

      setSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6"
    >
      {!selectedPaymentMethod && (
        <PaymentElement />
      )}

      <button
        type="submit"
        disabled={!stripe || submitting}
        className="w-full rounded-full bg-marquee-gold px-6 py-3 font-semibold text-marquee-bg transition hover:bg-marquee-goldBright disabled:cursor-not-allowed disabled:opacity-40"
      >
        {submitting
          ? 'Processing payment...'
          : `Pay $${order.totalAmount.toFixed(2)} with card`}
      </button>
    </form>
  );
}

export default function StripeCheckout({
  order,
  onSuccess,
  onError,
  paymentMethods = [],
  paymentMethodsLoading = false,
  onPaymentMethodAdded,
}) {
  const [clientSecret, setClientSecret] = useState(null);
  const [loadError, setLoadError] = useState('');

  const [selectedPaymentMethod, setSelectedPaymentMethod] =
    useState(null);

  useEffect(() => {
    if (!paymentMethods.length) {
      setSelectedPaymentMethod(null);
      return;
    }

    const defaultMethod = paymentMethods.find(
      (method) => method.isDefault
    );

    setSelectedPaymentMethod(
      defaultMethod?.id || paymentMethods[0]?.id || null
    );
  }, [paymentMethods]);

  useEffect(() => {
    if (!order?._id) return;

    setClientSecret(null);
    setLoadError('');

    const request = {
      orderId: order._id,
    };

    if (selectedPaymentMethod) {
      request.paymentMethodId = selectedPaymentMethod;
    }

    api.post('/payments/stripe/create-intent', request)
      .then(({ data }) => {
        setClientSecret(data.clientSecret);
      })
      .catch((err) => {
        setLoadError(
          err.response?.data?.error ||
          err.message ||
          'Failed to create payment'
        );
      });
  }, [order?._id, selectedPaymentMethod]);

  if (!stripePromise) {
    return (
      <p className="rounded-md border border-marquee-line bg-marquee-panel2 p-4 text-sm text-marquee-muted">
        Stripe isn't configured yet. Set{' '}
        <code>VITE_STRIPE_PUBLISHABLE_KEY</code>{' '}
        in the frontend .env file to enable card
        payments.
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
        />
      </Elements>
    </>
  );
}