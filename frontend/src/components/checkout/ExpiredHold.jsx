export default function ExpiredHold({ onBack }) {
    return (
        <div className="rounded-xl border border-marquee-marquee/40 bg-marquee-marquee/10 p-6 text-center">
            <p className="mb-4 text-marquee-cream">
                Your seats are no longer reserved.
            </p>

            <button
                onClick={onBack}
                className="rounded-full bg-marquee-gold px-6 py-2 font-semibold text-marquee-bg"
            >
                Choose seats again
            </button>
        </div>
    );
}