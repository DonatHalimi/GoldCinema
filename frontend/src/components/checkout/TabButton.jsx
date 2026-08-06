export default function TabButton({
    active,
    onClick,
    children,
}) {
    return (
        <button
            onClick={onClick}
            className={`
        flex-1 rounded-full border px-4 py-2 text-sm font-semibold transition
        ${active
                    ? 'border-marquee-gold bg-marquee-gold text-marquee-bg'
                    : 'border-marquee-line text-marquee-muted hover:border-marquee-gold hover:text-marquee-gold'
                }
      `}
        >
            {children}
        </button>
    );
}