import { useEffect, useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import api from '../../api/client';

const stripePromise = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY
  ? loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY)
  : null;

export default function ApplePayCheckout({ order, onSuccess, onError }) {
  const [canMakePayment, setCanMakePayment] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    let mountedLocal = true;
    setMounted(true);

    async function setupApplePay() {
      if (!order?._id || !stripePromise) return;

      try {
        const stripe = await stripePromise;

        const { data } = await api.post('/payments/stripe/create-intent', { orderId: order._id });
        const clientSecret = data.clientSecret;

        const paymentRequest = stripe.paymentRequest({
          country: 'US',
          currency: (order.currency || 'USD').toLowerCase(),
          total: {
            label: 'GoldCinema Tickets',
            amount: Math.round(order.totalAmount * 100),
          },
          requestPayerName: true,
          requestPayerEmail: true,
        });

        const result = await paymentRequest.canMakePayment();

        if (mountedLocal && result) {
          setCanMakePayment(true);

          const elements = stripe.elements();
          const prButton = elements.create('paymentRequestButton', { paymentRequest });

          const mountId = `apple-pay-button-${order._id}`;
          const el = document.getElementById(mountId);
          if (el) {
            prButton.mount(`#${mountId}`);
          }

          paymentRequest.on('paymentmethod', async (ev) => {
            try {
              const { error, paymentIntent } = await stripe.confirmCardPayment(
                clientSecret,
                { payment_method: ev.paymentMethod.id },
                { handleActions: false }
              );

              if (error) {
                ev.complete('fail');
                onError(error.message || 'Payment failed.');
                return;
              }

              if (paymentIntent.status === 'requires_action') {
                const { error: handledError } = await stripe.confirmCardPayment(clientSecret);
                if (handledError) {
                  ev.complete('fail');
                  onError(handledError.message || 'Payment authentication failed.');
                  return;
                }
              }

              ev.complete('success');

              const { data: serverData } = await api.post('/payments/stripe/confirm', {
                orderId: order._id,
                paymentIntentId: paymentIntent.id,
              });

              onSuccess(serverData.order);
            } catch (err) {
              try { ev.complete && ev.complete('fail'); } catch (e) {}
              onError(err.message || 'Apple Pay checkout failed.');
            }
          });
        }
      } catch (err) {
        console.error('ApplePay setup error:', err);
      }
    }

    setupApplePay();

    return () => { mountedLocal = false; setMounted(false); };
  }, [order?._id]);

  if (!stripePromise) {
    return (
      <p className="rounded-md border border-marquee-line bg-marquee-panel2 p-4 text-sm text-marquee-muted">
        Stripe isn't configured yet. Set <code>VITE_STRIPE_PUBLISHABLE_KEY</code> in the frontend .env file to enable Apple Pay.
      </p>
    );
  }

  if (!canMakePayment) {
    return (
      <p className="text-sm text-marquee-muted">Apple Pay / Payment Request not available on this device or browser.</p>
    );
  }

  return (
    <div>
      <div id={`apple-pay-button-${order._id}`} />
      <p className="mt-4 text-sm text-marquee-muted">You can pay securely with Apple Pay or the browser payment sheet.</p>
    </div>
  );
}
