import { Clock } from 'lucide-react';

function formatTime(seconds) {
    if (seconds == null) return '--:--';
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${String(s).padStart(2, '0')}`;
}

export default function SeatHoldTimer({ secondsLeft, expired, extending, onExtend, inline = false }) {
    const urgent = !expired && secondsLeft != null && secondsLeft <= 120;

    if (inline) {
        return (
            <div className="flex items-center gap-2.5 text-xs">
                <Clock className={`h-4 w-4 ${urgent || expired ? 'text-marquee-marquee' : 'text-marquee-gold'}`} />

                <span className="text-marquee-muted">Held for</span>

                <span
                    className={`font-display text-base leading-none tracking-wide tabular-nums ${expired
                        ? 'text-marquee-marquee'
                        : urgent
                            ? 'text-marquee-marquee'
                            : 'text-marquee-cream'
                        }`}
                >
                    {expired ? 'Expired' : formatTime(secondsLeft)}
                </span>

                {!expired && (
                    <button
                        type="button"
                        onClick={onExtend}
                        disabled={extending}
                        className="ml-1 rounded-full border border-marquee-gold/60 px-2.5 py-1 text-[11px] font-semibold text-marquee-gold transition hover:bg-marquee-gold hover:text-marquee-bg disabled:opacity-50"
                    >
                        {extending ? '…' : 'Extend'}
                    </button>
                )}
            </div>
        );
    }

    return (
        <div className="flex items-center justify-between gap-4 rounded-xl border border-marquee-line bg-marquee-panel2 px-5 py-4">
            <div className="flex items-center gap-3">
                <Clock className={`h-5 w-5 ${urgent || expired ? 'text-marquee-marquee' : 'text-marquee-gold'}`} />

                <div>
                    <p className="text-xs uppercase tracking-wider text-marquee-muted">
                        Seats held for
                    </p>

                    <p
                        className={`font-display text-3xl tracking-wide ${expired
                            ? 'text-marquee-marquee'
                            : urgent
                                ? 'text-marquee-marquee'
                                : 'text-marquee-cream'
                            }`}
                    >
                        {expired ? 'Expired' : formatTime(secondsLeft)}
                    </p>
                </div>
            </div>

            {!expired && (
                <button
                    type="button"
                    onClick={onExtend}
                    disabled={extending}
                    className="rounded-full border border-marquee-gold px-4 py-2 text-sm font-semibold text-marquee-gold transition hover:bg-marquee-gold hover:text-marquee-bg disabled:opacity-50"
                >
                    {extending ? 'Extending…' : 'Extend hold'}
                </button>
            )}
        </div>
    );
}