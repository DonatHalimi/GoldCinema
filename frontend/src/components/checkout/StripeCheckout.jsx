import { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';
import api from '../../api/client';

const stripePromise = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY
  ? loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY)
  : null;


function StripeForm({ order, onSuccess, onError }) {
  const stripe = useStripe();
  const elements = useElements();

  const [submitting, setSubmitting] = useState(false);


  async function handleSubmit(e) {
    e.preventDefault();

    if (!stripe || !elements) return;


    setSubmitting(true);
    onError('');


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

      console.error("STRIPE CONFIRM ERROR:", err);

      onError(
        err.response?.data?.error ||
        err.message ||
        'Payment confirmation failed.'
      );

    } finally {
      setSubmitting(false);
    }
  }


  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6"
    >

      <PaymentElement />

      <button
        type="submit"
        disabled={!stripe || submitting}
        className="w-full rounded-full bg-marquee-gold px-6 py-3 font-semibold text-marquee-bg transition hover:bg-marquee-goldBright disabled:cursor-not-allowed disabled:opacity-40"
      >
        {
          submitting
            ? 'Processing payment...'
            : `Pay $${order.totalAmount.toFixed(2)} with card`
        }

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

  useEffect(() => {
    if (!order?._id) return;

    api
      .post(
        '/payments/stripe/create-intent',
        {
          orderId: order._id,
        }
      )
      .then(({ data }) => {
        setClientSecret(data.clientSecret);
      })
      .catch((err) => {
        console.error(
          "STRIPE INTENT ERROR:",
          err
        );
        setLoadError(
          err.response?.data?.error ||
          err.message ||
          'Failed to create payment'
        );

      });
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
        order={order}
        onSuccess={onSuccess}
        onError={onError}
        onReady={onReady}
      />
    </Elements>
  );
}