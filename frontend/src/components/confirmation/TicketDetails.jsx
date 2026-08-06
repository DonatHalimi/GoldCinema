export default function TicketDetails({ order }) {
    return (
        <div className="border-t border-dashed border-marquee-line px-6 py-4">
            <div className="flex items-center justify-between text-sm">
                <span className="text-marquee-muted">
                    Seats
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