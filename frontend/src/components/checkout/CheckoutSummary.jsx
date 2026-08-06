export default function CheckoutSummary({ movie, showtime, order }) {
    return (
        <div className="mb-5 rounded-xl border border-marquee-line bg-marquee-panel p-6">
            <div className="flex justify-between gap-4">
                <div className="flex gap-5">
                    {movie?.posterUrl && (
                        <img
                            src={movie.posterUrl}
                            alt={`${movie.title} poster`}
                            className="h-52 w-36 rounded-lg border border-marquee-line object-cover shadow-glow"
                        />
                    )}

                    <div>
                        <p className="text-xs uppercase tracking-widest text-marquee-goldDim">
                            {movie?.title}
                        </p>

                        <p className="mt-1 text-sm text-marquee-muted">
                            {movie?.genres?.join(', ')}
                            {' · '}
                            {movie?.rating}
                            {' · '}
                            {movie?.duration} min
                        </p>

                        {showtime && (
                            <p className="mt-1 text-sm text-marquee-muted">
                                {new Date(showtime.startTime).toLocaleDateString()}
                                {' · '}
                                {new Date(showtime.startTime).toLocaleTimeString([], {
                                    hour: '2-digit',
                                    minute: '2-digit',
                                })}
                            </p>
                        )}

                        <p className="mt-2 font-mono text-sm text-marquee-muted">
                            Seats: {order.seats?.join(', ')}
                        </p>
                    </div>
                </div>

                <p className="font-display text-3xl tracking-wide text-marquee-gold">
                    ${order.totalAmount.toFixed(2)}
                </p>
            </div>
        </div>
    );
}