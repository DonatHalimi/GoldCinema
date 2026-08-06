import { Loader2 } from 'lucide-react';

export default function SeatSelectionSummary({
    selected,
    total,
    submitting,
    onContinue,
}) {
    return (
        <div className="ticket-edge mt-8 flex items-center justify-between rounded-lg border border-dashed border-marquee-line bg-marquee-panel2 px-8 py-5">
            <div>
                <p className="text-xs uppercase tracking-widest text-marquee-muted">
                    {selected.length} seats selected
                </p>

                <p className="font-mono text-sm text-marquee-muted">
                    {selected.join(', ') || '—'}
                </p>
            </div>

            <div className="text-right">
                <p className="font-display text-3xl tracking-wide text-marquee-gold">
                    ${total.toFixed(2)}
                </p>

                <button
                    onClick={onContinue}
                    disabled={!selected.length || submitting}
                    className="mt-2 inline-flex items-center justify-center gap-2 rounded-full bg-marquee-gold px-6 py-2 font-semibold text-marquee-bg transition disabled:cursor-not-allowed disabled:opacity-40"
                >
                    {submitting && <Loader2 className="h-4 w-4 animate-spin" />}

                    {submitting ? 'Reserving...' : 'Continue to payment'}
                </button>
            </div>
        </div>
    );
}