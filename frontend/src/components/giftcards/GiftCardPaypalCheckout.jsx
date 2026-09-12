import { PayPalButtons, PayPalScriptProvider } from '@paypal/react-paypal-js';
import { captureGiftCardPaypalOrder, createGiftCardPaypalOrder } from '../../api/giftCard';

const clientId = import.meta.env.VITE_PAYPAL_CLIENT_ID;

export default function GiftCardPaypalCheckout({ giftCardId, currency, onSuccess, onError }) {
    if (!clientId) {
        return (
            <p className="rounded-md border border-marquee-line bg-marquee-panel2 p-4 text-sm text-marquee-muted">
                PayPal isn't configured yet. Set <code>VITE_PAYPAL_CLIENT_ID</code> in the frontend .env file.
            </p>
        );
    }

    return (
        <PayPalScriptProvider options={{ clientId, currency: currency || 'USD', intent: 'capture' }}>
            <PayPalButtons
                style={{ layout: 'vertical', color: 'gold', shape: 'pill', label: 'pay' }}
                createOrder={async () => {
                    onError('');
                    const { data } = await createGiftCardPaypalOrder(giftCardId);
                    return data.orderID;
                }}
                onApprove={async (data) => {
                    try {
                        const { data: result } = await captureGiftCardPaypalOrder(giftCardId, data.orderID);
                        onSuccess(result.giftCard);
                    } catch (err) {
                        onError(err.response?.data?.error || err.message || 'PayPal checkout failed.');
                    }
                }}
                onError={(err) => onError(err?.message || 'PayPal checkout failed. Please try again.')}
            />
        </PayPalScriptProvider>
    );
}