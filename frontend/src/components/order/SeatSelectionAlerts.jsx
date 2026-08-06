export default function SeatSelectionAlerts({
    error,
    needsVerification,
    resending,
    onResend,
}) {
    return (
        <>
            {error && (
                <p className="mb-6 rounded-md border border-marquee-marquee/40 bg-marquee-marquee/10 px-4 py-2 text-center text-sm text-marquee-marquee">
                    {error}
                </p>
            )}

            {needsVerification && (
                <div className="mb-6 rounded-md border border-marquee-gold/40 bg-marquee-gold/10 px-4 py-4 text-center text-sm text-marquee-cream">
                    {needsVerification === 'sent' ? (
                        <p>A new verification link is on its way.</p>
                    ) : (
                        <>
                            <p className="mb-2">
                                Please verify your email before booking tickets.
                            </p>

                            <button
                                onClick={onResend}
                                disabled={resending}
                                className="rounded-full border border-marquee-gold px-4 py-1.5 text-marquee-gold"
                            >
                                {resending ? 'Sending...' : 'Resend verification email'}
                            </button>
                        </>
                    )}
                </div>
            )}
        </>
    );
}