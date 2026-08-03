import { PayPalScriptProvider, PayPalButtons } from '@paypal/react-paypal-js';
import api from '../api/client';

const clientId = import.meta.env.VITE_PAYPAL_CLIENT_ID;

export default function PaypalCheckout({ booking, onSuccess, onError }) {
  if (!clientId) {
    return (
      <p className="rounded-md border border-marquee-line bg-marquee-panel2 p-4 text-sm text-marquee-muted">
        PayPal isn't configured yet. Set <code>VITE_PAYPAL_CLIENT_ID</code> in the frontend .env
        file to enable PayPal payments.
      </p>
    );
  }

  return (
    <PayPalScriptProvider
      options={{ clientId, currency: booking.currency || 'USD', intent: 'capture' }}
    >
      <PayPalButtons
        style={{ layout: 'vertical', color: 'gold', shape: 'pill', label: 'pay' }}
        createOrder={async () => {
          onError('');
          const { data } = await api.post('/payments/paypal/create-order', {
            bookingId: booking.id,
          });
          return data.orderID;
        }}
        onApprove={async (data) => {
          try {
            const { data: result } = await api.post('/payments/paypal/capture-order', {
              bookingId: booking.id,
              orderID: data.orderID,
            });
            onSuccess(result.booking);
          } catch (err) {
            onError(err.message);
          }
        }}
        onError={(err) => {
          onError(err?.message || 'PayPal checkout failed. Please try again.');
        }}
      />
    </PayPalScriptProvider>
  );
}
