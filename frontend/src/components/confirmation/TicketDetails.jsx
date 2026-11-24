import { useTranslation } from "react-i18next";

export default function TicketDetails({ order }) {
    const { t } = useTranslation('account');
    const concessions = order.snacks || [];

    return (
        <div className="border-t border-dashed border-marquee-line px-6 py-4">
            <div className="flex items-center justify-between text-sm">
                <span className="text-marquee-muted">
                    {t('seatsNr')}
                </span>

                <span className="font-mono text-marquee-cream">
                    {order.seats.join(', ')}
                </span>
            </div>

            <div className="mt-2 flex items-center justify-between text-sm">
                <span className="text-marquee-muted">
                    Paid via
                </span>

                <span className="capitalize text-marquee-cream">
                    {order.paymentProvider}
                </span>
            </div>

            {concessions.length > 0 && (
                <div className="mt-4 rounded-lg border border-marquee-gold/20 bg-marquee-gold/5 p-3">
                    <p className="text-xs font-semibold uppercase tracking-wider text-marquee-goldDim">
                        Concessions pickup
                    </p>
                    <ul className="mt-2 space-y-1">
                        {concessions.map((item, index) => (
                            <li
                                className="flex items-center justify-between gap-4 text-sm"
                                key={`${item.catalogId || item.snack?._id || item.name || index}-${index}`}
                            >
                                <span className="text-marquee-cream">
                                    {item.name || item.snack?.name || 'Concession'}
                                </span>
                                <span className="shrink-0 text-marquee-muted">× {item.quantity}</span>
                            </li>
                        ))}
                    </ul>
                    <p className="mt-2 text-xs text-marquee-muted">Show this QR code when collecting your order.</p>
                </div>
            )}

            <div className="mt-2 flex items-center justify-between text-sm">
                <span className="text-marquee-muted">
                    Total
                </span>

                <span className="font-display text-xl text-marquee-gold">
                    ${order.totalAmount.toFixed(2)}
                </span>
            </div>

            <div className="mt-2 flex items-center justify-between text-xs text-marquee-muted">
                <span>
                    Confirmation
                </span>

                <span className="font-mono">
                    {order._id.slice(0, 8).toUpperCase()}
                </span>
            </div>
        </div>
    );
}