import TabButton from './TabButton';

export default function PaymentTabs({
    provider,
    setProvider,
}) {
    return (
        <div className="mb-6 flex gap-2">
            <TabButton
                active={provider === 'stripe'}
                onClick={() => setProvider('stripe')}
            >
                Card (Stripe)
            </TabButton>

            <TabButton
                active={provider === 'paypal'}
                onClick={() => setProvider('paypal')}
            >
                PayPal
            </TabButton>

            <TabButton
                active={provider === 'applepay'}
                onClick={() => setProvider('applepay')}
            >
                Apple Pay
            </TabButton>
        </div>
    );
}