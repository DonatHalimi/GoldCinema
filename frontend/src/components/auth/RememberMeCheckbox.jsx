import { Check } from 'lucide-react';

export default function RememberMeCheckbox({
    checked,
    onChange,
}) {
    return (
        <button
            type="button"
            onClick={() => onChange(!checked)}
            className="flex items-center gap-2 text-sm text-marquee-muted"
        >
            <span
                className={`
          inline-flex h-4 w-4 items-center justify-center rounded border
          ${checked
                        ? 'bg-marquee-gold border-marquee-gold text-zinc-950'
                        : 'border-marquee-line'
                    }
        `}
            >
                {checked && (
                    <Check className="h-3 w-3 stroke-[3]" />
                )}
            </span>
            <span>
                Keep me signed in
            </span>
        </button>
    );
}