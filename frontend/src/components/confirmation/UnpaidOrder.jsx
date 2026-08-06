import { Link } from 'react-router-dom';

export default function UnpaidOrder({ orderId }) {
    return (
        <div className="mx-auto max-w-lg px-6 py-20 text-center">
            <p className="text-marquee-cream">
                This order has not been paid yet.
            </p>

            <Link
                to={`/checkout/${orderId}`}
                className="mt-4 inline-block rounded-full bg-marquee-gold px-6 py-2 font-semibold text-marquee-bg"
            >
                Go to checkout
            </Link>
        </div>
    );
}