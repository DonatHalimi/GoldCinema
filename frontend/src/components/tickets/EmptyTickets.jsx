import { Link } from 'react-router-dom';

export default function EmptyTickets() {
    return (
        <div className="rounded-xl border border-dashed border-marquee-line p-10 text-center">
            <p className="text-marquee-muted">
                You haven't booked any tickets yet.
            </p>

            <Link
                to="/"
                className="mt-4 inline-block rounded-full bg-marquee-gold px-6 py-2 font-semibold text-marquee-bg"
            >
                Browse movies
            </Link>
        </div>
    );
}