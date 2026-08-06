const STATUS_STYLES = {
    paid: 'text-marquee-gold border-marquee-gold/40',
    pending: 'text-marquee-muted border-marquee-line',
    failed: 'text-marquee-marquee border-marquee-marquee/40',
    refunded: 'text-marquee-muted/60 border-marquee-line/60',
};

export default function TicketStatus({ status }) {
    return (
        <span
            className={`inline-block rounded-full border px-2 py-0.5 text-xs uppercase tracking-wide ${STATUS_STYLES[status] || ''
                }`}
        >
            {status}
        </span>
    );
}