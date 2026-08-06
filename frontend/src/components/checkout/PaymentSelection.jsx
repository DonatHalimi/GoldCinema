import StripeCheckout from './StripeCheckout';
import PaypalCheckout from './PaypalCheckout';
import PaymentTabs from './PaymentTabs';

export default function PaymentSection({
    provider,
    setProvider,
    order,
    onSuccess,
    onError,
    payError,
}) {
    return (
        <div className="rounded-xl border border-marquee-line bg-marquee-panel p-6">

            <PaymentTabs
                provider={provider}
                setProvider={setProvider}
            />

            {payError && (
                <p className="mb-4 rounded-md border border-marquee-marquee/40 bg-marquee-marquee/10 px-4 py-2 text-sm text-marquee-marquee">
                    {payError}
                </p>
            )}

            {provider === 'stripe' ? (
                <StripeCheckout
                    order={order}
                    onSuccess={onSuccess}
                    onError={onError}
                />
            ) : (
                <PaypalCheckout
                    order={order}
                    onSuccess={onSuccess}
                    onError={onError}
                />
            )}

            <p className="mt-6 text-center text-xs text-marquee-muted">
                🔒 Payments are processed securely by Stripe and PayPal.
            </p>
        </div>
    );
}