import {
    ArrowRight,
    Check,
    Gift,
    Loader2,
    Tag,
    X,
} from 'lucide-react';
import { useState } from 'react';
import { applyGiftCard, removeGiftCard } from '../../api/giftCard';

export default function GiftCardBox({ order, onOrderUpdated }) {
    const [code, setCode] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');

    const applied = Boolean(order.giftCardCode);

    async function handleApply(e) {
        e.preventDefault();

        const trimmedCode = code.trim();

        if (!trimmedCode || submitting) return;

        setSubmitting(true);
        setError('');

        try {
            const data = await applyGiftCard(order._id, trimmedCode);

            onOrderUpdated(data.order);
            setCode('');
        } catch (err) {
            setError(err.response?.data?.error || err.message || 'Failed to apply gift card.');
        } finally {
            setSubmitting(false);
        }
    }

    async function handleRemove() {
        if (submitting) return;

        setSubmitting(true);
        setError('');

        try {
            const data = await removeGiftCard(order._id);

            onOrderUpdated(data.order);
        } catch (err) {
            setError(err.response?.data?.error || err.message || 'Failed to remove gift card.');
        } finally {
            setSubmitting(false);
        }
    }

    if (applied) {
        return (
            <div className="mb-6 overflow-hidden rounded-2xl border border-marquee-gold/30 bg-gradient-to-br from-marquee-gold/10 via-marquee-panel2 to-marquee-panel2 shadow-lg shadow-black/10">
                <div className="relative p-5">
                    <div className="pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full bg-marquee-gold/10 blur-3xl" />

                    <div className="relative flex items-center justify-between gap-4">
                        <div className="flex min-w-0 items-center gap-4">
                            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-marquee-gold/30 bg-marquee-gold/10">
                                <Gift className="h-5 w-5 text-marquee-gold" />
                            </div>

                            <div className="min-w-0">
                                <div className="flex items-center gap-2">
                                    <div className="flex h-5 w-5 items-center justify-center rounded-full bg-marquee-gold/15">
                                        <Check className="h-3 w-3 text-marquee-gold" />
                                    </div>

                                    <p className="text-sm font-semibold text-marquee-cream">
                                        Gift card applied
                                    </p>
                                </div>

                                <div className="mt-1.5 flex flex-wrap items-center gap-2 text-xs">
                                    <span className="font-mono tracking-wide text-marquee-muted">
                                        {order.giftCardCode}
                                    </span>

                                    <span className="h-1 w-1 rounded-full bg-marquee-line" />

                                    <span className="font-semibold text-marquee-gold">
                                        −${order.giftCardAmount.toFixed(2)}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <button
                            type="button"
                            onClick={handleRemove}
                            disabled={submitting}
                            aria-label="Remove gift card"
                            className="group flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-marquee-line bg-marquee-panel2 text-marquee-muted transition-all duration-200 hover:border-red-400/30 hover:bg-red-400/10 hover:text-red-400 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                            {submitting ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                                <X className="h-4 w-4 transition-transform duration-200 group-hover:rotate-90" />
                            )}
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="mb-6 overflow-hidden rounded-2xl border border-marquee-line bg-marquee-panel shadow-lg shadow-black/10">
            <div className="p-5">
                <div className="mb-4 flex items-start gap-4">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-marquee-gold/20 bg-marquee-gold/10">
                        <Gift className="h-5 w-5 text-marquee-gold" />
                    </div>

                    <div>
                        <h3 className="text-sm font-semibold text-marquee-cream">
                            Have a gift card?
                        </h3>

                        <p className="mt-1 text-xs leading-relaxed text-marquee-muted">
                            Enter your gift card code to apply the available
                            balance to this order.
                        </p>
                    </div>
                </div>

                <form onSubmit={handleApply}>
                    <div
                        className={`group flex items-center overflow-hidden rounded-xl border bg-marquee-panel2 transition-all duration-200 ${error
                            ? 'border-red-400/50 ring-2 ring-red-400/5'
                            : 'border-marquee-line focus-within:border-marquee-gold/60 focus-within:ring-2 focus-within:ring-marquee-gold/10'
                            }`}
                    >
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center text-marquee-muted transition-colors group-focus-within:text-marquee-gold">
                            <Tag className="h-4 w-4" />
                        </div>

                        <input
                            type="text"
                            value={code}
                            onChange={(e) => {
                                setCode(
                                    e.target.value
                                        .toUpperCase()
                                        .replace(/\s/g, '')
                                );

                                if (error) {
                                    setError('');
                                }
                            }}
                            placeholder="Enter gift card code"
                            autoComplete="off"
                            spellCheck="false"
                            disabled={submitting}
                            className="min-w-0 flex-1 bg-transparent py-3 pr-3 font-mono text-sm font-medium tracking-wider text-marquee-cream outline-none placeholder:font-sans placeholder:font-normal placeholder:tracking-normal placeholder:text-marquee-muted/60 disabled:cursor-not-allowed disabled:opacity-50"
                        />

                        <button
                            type="submit"
                            disabled={submitting || !code.trim()}
                            className="mr-1.5 flex h-9 shrink-0 items-center gap-2 rounded-lg bg-marquee-gold px-3.5 text-xs font-bold text-marquee-bg transition-all duration-200 hover:bg-marquee-goldBright hover:shadow-lg hover:shadow-marquee-gold/10 disabled:cursor-not-allowed disabled:opacity-30"
                        >
                            {submitting ? (
                                <>
                                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                    Applying
                                </>
                            ) : (
                                <>
                                    Apply
                                    <ArrowRight className="h-3.5 w-3.5" />
                                </>
                            )}
                        </button>
                    </div>

                    {error && (
                        <div className="mt-2 flex items-center gap-2 px-1 text-xs text-red-400">
                            <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-red-400" />
                            <span>{error}</span>
                        </div>
                    )}
                </form>

                {!error && (
                    <div className="mt-3 flex items-center gap-2 px-1 text-[11px] text-marquee-muted">
                        <div className="h-1 w-1 rounded-full bg-marquee-gold/60" />
                        <span>Gift card balance will be deducted from your total.</span>
                    </div>
                )}
            </div>
        </div>
    );
}