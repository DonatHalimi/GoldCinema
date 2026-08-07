import { Link } from 'react-router-dom';
import NotFoundIcon from '/not-found.png';

export default function NotFound() {
    return (
        <section className="relative flex min-h-[115vh] items-center justify-center overflow-hidden px-6">
            <div className="absolute inset-0">
                <div className="absolute left-1/2 top-1/2 h-[550px] w-[550px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-marquee-gold/10 blur-[140px]" />
            </div>

            <div className="relative z-10 max-w-xl text-center">
                <img
                    src={NotFoundIcon}
                    alt="Not Found"
                    className="mx-auto mb-8 h-44 w-44 drop-shadow-[0_0_35px_rgba(212,175,55,.45)]"
                />

                <h1 className="font-display text-5xl tracking-wide text-marquee-goldBright sm:text-6xl">
                    404
                </h1>

                <h2 className="mt-4 text-3xl font-semibold text-marquee-cream">
                    Scene Missing
                </h2>

                <p className="mx-auto mt-5 max-w-sm text-base leading-6 text-marquee-muted">
                    Looks like this scene never made it to the final cut.
                    The page you're looking for doesn't exist or has been moved.
                </p>

                <Link
                    to="/"
                    className="mt-10 inline-flex items-center rounded-full border border-marquee-gold bg-marquee-panel px-8 py-3 font-semibold text-marquee-gold transition-all duration-300 hover:-translate-y-1 hover:bg-marquee-gold hover:text-marquee-bg hover:shadow-[0_0_30px_rgba(212,175,55,.35)]"
                >
                    ← Return to Home
                </Link>
            </div>
        </section>
    );
}