const BRAND_THEME = {
    visa: {
        label: 'VISA',
        accent: '#d8bd72',
        brandColor: '#1a1f71',
    },
    mastercard: {
        label: 'Mastercard',
        accent: '#e2b45f',
        brandColor: '#eb001b',
    },
    amex: {
        label: 'AMEX',
        accent: '#d8bd82',
        brandColor: '#8fd3ff',
    },
    discover: {
        label: 'Discover',
        accent: '#e5a94a',
        brandColor: '#f6a623',
    },
    generic: {
        label: 'CARD',
        accent: '#c9a15a',
        brandColor: '#c9a15a',
    },
};

function formatNumber(cardNumber, masked) {
    const digits = String(cardNumber || '').replace(/\D/g, '');

    if (!digits) {
        return '•••• •••• •••• ••••';
    }

    const groups = digits.match(/.{1,4}/g) || [];

    if (!masked) {
        return groups.join(' ');
    }

    return groups
        .map((group, index) => {
            if (index < groups.length - 1) {
                return '••••';
            }

            return group.padStart(4, '•');
        })
        .join(' ');
}

function ContactlessIcon() {
    return (
        <svg
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden="true"
        >
            <path
                d="M8.2 9.2a4.2 4.2 0 0 0 0 5.6"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
            />

            <path
                d="M11.2 6.5a8 8 0 0 0 0 11"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
            />

            <path
                d="M14.2 3.8a11.8 11.8 0 0 0 0 16.4"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
            />
        </svg>
    );
}

function Chip() {
    return (
        <div
            className="
                relative
                h-10
                w-[52px]
                overflow-hidden
                rounded-[7px]
                border
                border-[#d8bd72]/40
                bg-[linear-gradient(135deg,#c8ad68_0%,#f0d995_45%,#9e8244_100%)]
                shadow-[0_2px_8px_rgba(0,0,0,0.35)]
            "
            aria-hidden="true"
        >
            <div className="absolute inset-[5px] rounded-[4px] border border-black/25" />

            <div className="absolute left-1/2 top-0 h-full w-px bg-black/20" />

            <div className="absolute left-0 top-1/2 h-px w-full bg-black/20" />

            <div className="absolute left-[25%] top-0 h-full w-px bg-black/15" />

            <div className="absolute right-[25%] top-0 h-full w-px bg-black/15" />

            <div className="absolute left-0 top-[28%] h-px w-[25%] bg-black/15" />

            <div className="absolute right-0 top-[28%] h-px w-[25%] bg-black/15" />

            <div className="absolute left-0 top-[72%] h-px w-[25%] bg-black/15" />

            <div className="absolute right-0 top-[72%] h-px w-[25%] bg-black/15" />
        </div>
    );
}

function VisaBrandMark() {
    return (
        <img
            src="/visa.png"
            alt="Visa"
            className="h-7 w-auto object-contain"
        />
    );
}

function BrandMark({ type, label }) {
    if (type === 'visa') {
        return <VisaBrandMark />;
    }

    if (type === 'mastercard') {
        return (
            <div className="flex items-center gap-[-4px] text-white" aria-label="Mastercard">
                <span className="h-7 w-7 rounded-full bg-[#eb001b] shadow-[0_0_12px_rgba(235,0,27,0.18)]" />
                <span className="-ml-3 h-7 w-7 rounded-full bg-[#f79e1b] mix-blend-screen shadow-[0_0_12px_rgba(247,158,27,0.15)]" />
            </div>
        );
    }

    if (type === 'amex') {
        return (
            <div className="rounded border border-[#8fd3ff]/50 px-2 py-1 text-[10px] font-bold tracking-[0.18em] text-[#d8f0ff]">
                AMEX
            </div>
        );
    }

    if (type === 'discover') {
        return (
            <div className="flex items-center gap-1.5">
                <span className="text-[12px] font-semibold tracking-wide text-white">
                    DISCOVER
                </span>

                <span className="h-2.5 w-2.5 rounded-full bg-[#f6a623]" />
            </div>
        );
    }

    return (
        <span className="text-[11px] font-semibold uppercase tracking-[0.22em] text-marquee-cream">
            {label}
        </span>
    );
}

export default function CreditCard3D({
    cardNumber,
    cardHolderName = 'CARD HOLDER',
    expirationDate,
    cardType = 'generic',
    masked = true,
    className = '',
}) {
    const theme = BRAND_THEME[cardType] || BRAND_THEME.generic;

    const last4 =
        String(cardNumber || '')
            .replace(/\D/g, '')
            .slice(-4) || '0000';

    const formattedNumber = formatNumber(cardNumber, masked);

    return (
        <div
            className={`hover-3d w-full ${className}`}
            role="img"
            aria-label={`${theme.label} card ending in ${last4}, held by ${cardHolderName}`}
        >
            <div className="relative flex aspect-[1.586/1] w-full flex-col justify-between overflow-hidden rounded-2xl border border-white/[0.09] bg-[#0a0b0e] p-5 shadow-[0_18px_45px_rgba(0,0,0,0.35)] sm:p-6">
                <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(145deg,#24252a_0%,#17181c_38%,#0d0e11_72%,#08090b_100%)]" />

                {cardType === 'visa' && (
                    <div className="pointer-events-none absolute -right-16 -top-20 h-56 w-56 rounded-full bg-[#1a1f71]/25 blur-3xl" />
                )}

                <div className="pointer-events-none absolute -bottom-20 -left-16 h-48 w-48 rounded-full blur-3xl"
                    style={{
                        backgroundColor: theme.accent,
                        opacity: 0.07,
                    }}
                />

                <div className="pointer-events-none absolute -right-24 top-10 h-px w-[150%] rotate-[-28deg] bg-white/[0.06]" />

                <div className="pointer-events-none absolute -right-20 top-16 h-px w-[140%] rotate-[-28deg] bg-white/[0.035]" />

                <div className="pointer-events-none absolute -left-20 bottom-14 h-px w-[120%] rotate-[-28deg] bg-white/[0.035]" />

                {cardType === 'visa' && (
                    <>
                        <div className="pointer-events-none absolute -right-24 bottom-[-70px] h-44 w-[85%] rotate-[-25deg] bg-[#1a1f71]/20 blur-2xl" />

                        <div className="pointer-events-none absolute right-[-90px] top-[-30px] h-40 w-[65%] rotate-[-25deg] border-l border-[#30357f]/25" />
                    </>
                )}

                <div className="pointer-events-none absolute inset-0 opacity-[0.035] [background-image:linear-gradient(135deg,transparent_48%,#fff_49%,transparent_50%)] [background-size:9px_9px]" />

                <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(115deg,rgba(255,255,255,0.07)_0%,transparent_20%,transparent_65%,rgba(255,255,255,0.025)_100%)]" />

                <div className="relative z-10 flex items-start justify-between">
                    <div className="flex items-center gap-3">
                        <Chip />

                        <span className="hidden text-[7px] font-medium uppercase tracking-[0.16em] text-white/25 sm:block">EMV</span>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="text-white/70">
                            <ContactlessIcon />
                        </div>

                        <BrandMark
                            type={cardType}
                            label={theme.label}
                        />
                    </div>
                </div>

                <div className="relative z-10 mt-auto pt-5">
                    <div className="text-[clamp(0.95rem,2.4vw,1.45rem)] font-medium tracking-[0.16em] text-marquee-cream [text-shadow:0_1px_2px_rgba(0,0,0,0.45)]">
                        {formattedNumber}
                    </div>
                </div>

                <div className="relative z-10 mt-5 flex items-end justify-between">
                    <div className="min-w-0">
                        <div className="mb-1 text-[7px] font-medium uppercase tracking-[0.18em] text-white/35">Cardholder</div>

                        <div className="max-w-[170px] truncate text-[clamp(0.55rem,1.5vw,0.78rem)] font-medium uppercase tracking-[0.14em] text-marquee-cream">{cardHolderName || 'CARD HOLDER'}</div>
                    </div>

                    <div className="flex items-end gap-5">
                        <div>
                            <div className="mb-1 text-[7px] font-medium uppercase tracking-[0.18em] text-white/35">Valid Thru</div>

                            <div className="text-[clamp(0.6rem,1.6vw,0.82rem)] font-medium tracking-[0.14em] text-marquee-cream">{expirationDate || '--/--'}</div>
                        </div>

                        <div className="hidden flex-col items-end sm:flex">
                            <span className="text-[7px] font-medium uppercase tracking-[0.2em] text-marquee-gold">
                                GOLDCINEMA
                            </span>

                            <span className="mt-0.5 text-[6px] tracking-[0.16em] text-white/25">
                                MEMBER
                            </span>
                        </div>
                    </div>
                </div>

                <div className="pointer-events-none absolute bottom-0 left-[8%] right-[8%] h-px opacity-30"
                    style={{
                        background: `linear-gradient(
                            90deg,
                            transparent,
                            ${theme.accent},
                            transparent
                        )`,
                    }}
                />

                <div
                    className="pointer-events-none absolute right-0 top-0 h-16 w-16 rounded-bl-full opacity-20"
                    style={{
                        background: `radial-gradient(
                            circle at top right,
                            ${theme.accent},
                            transparent 70%
                        )`,
                    }}
                />
            </div>

            <div aria-hidden="true" />
            <div aria-hidden="true" />
            <div aria-hidden="true" />
            <div aria-hidden="true" />
            <div aria-hidden="true" />
            <div aria-hidden="true" />
            <div aria-hidden="true" />
            <div aria-hidden="true" />
        </div>
    );
}