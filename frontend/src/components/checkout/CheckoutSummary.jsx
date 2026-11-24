import { useTranslation } from "react-i18next";

export default function CheckoutSummary({ movie, showtime, order }) {
    const { t } = useTranslation('account');
    const snacks = order.snacks || [];

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
                                {new Date(showtime.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </p>
                        )}

                        <p className="mt-2 font-mono text-sm text-marquee-muted">
                            {t('seatsNr')}: {order.seats?.join(', ')}
                        </p>

                        <div className="mt-4 space-y-1.5 text-sm">
                            <div className="flex items-center justify-between gap-6">
                                <span className="text-marquee-muted">Movie tickets</span>
                                <span className="text-marquee-cream">${Number(order.ticketAmount || 0).toFixed(2)}</span>
                            </div>
                            {snacks.map((item, index) => {
                                const name = item.name || item.snack?.name || 'Concession';
                                return (
                                    <div className="flex items-center justify-between gap-6" key={`${item.catalogId || item.snack?._id || name}-${index}`}>
                                        <span className="text-marquee-muted">{name} × {item.quantity}</span>
                                        <span className="text-marquee-cream">${(Number(item.unitPrice || 0) * item.quantity).toFixed(2)}</span>
                                    </div>
                                );
                            })}
                            {Number(order.giftCardAmount) > 0 && (
                                <div className="flex items-center justify-between gap-6">
                                    <span className="text-marquee-muted">Gift card</span>
                                    <span className="text-marquee-cream">−${Number(order.giftCardAmount).toFixed(2)}</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <p className="font-display text-3xl tracking-wide text-marquee-gold">
                    ${order.totalAmount.toFixed(2)}
                </p>
            </div>
        </div>
    );
}