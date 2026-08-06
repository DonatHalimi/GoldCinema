export default function SeatHoldTimer({
    secondsLeft,
    expired,
    extending,
    onExtend,
}) {
    if (secondsLeft === null) return null;

    return (
        <div className="mt-5 mb-5 text-center">
            <p
                className={`text-sm ${secondsLeft < 60
                        ? 'text-marquee-marquee'
                        : 'text-marquee-muted'
                    }`}
            >
                {expired
                    ? ''
                    : `Seats reserved for ${Math.floor(secondsLeft / 60)}:${String(
                        secondsLeft % 60
                    ).padStart(2, '0')}`}
            </p>

            {!expired && (
                <button
                    onClick={onExtend}
                    disabled={extending}
                    className="mt-3 rounded-full border border-marquee-gold px-5 py-2 text-sm text-marquee-gold hover:bg-marquee-gold hover:text-marquee-bg disabled:opacity-40"
                >
                    {extending ? 'Extending...' : 'Extend time'}
                </button>
            )}
        </div>
    );
}