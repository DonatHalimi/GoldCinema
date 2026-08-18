export default function ConfirmationInput({
    id,
    value,
    onChange,
    confirmation,
    disabled = false,
    label = 'Type',
}) {
    const hasValue = value.length > 0;
    const isValid = value === confirmation;
    const isInvalid = hasValue && !isValid;

    return (
        <div>
            <label htmlFor={id} className="mb-2 block text-sm font-medium text-marquee-cream">
                {label}{' '}
                <span className="font-semibold text-red-400">
                    {confirmation}
                </span>{' '}
                to confirm
            </label>

            <input
                id={id}
                type="text"
                value={value}
                onChange={(event) =>
                    onChange(event.target.value)
                }
                placeholder={confirmation}
                autoComplete="off"
                disabled={disabled}
                className={`w-full rounded-lg border bg-marquee-panel2 px-4 py-2.5 text-sm text-marquee-cream outline-none transition-all placeholder:text-marquee-muted/50 ${isInvalid
                    ? 'border-red-500/50 focus:border-red-500'
                    : isValid
                        ? 'border-green-500/50 focus:border-green-500'
                        : 'border-marquee-line focus:border-marquee-gold'
                    } disabled:cursor-not-allowed disabled:opacity-60`}
            />

            {isInvalid && (
                <p className="mt-1.5 text-xs text-red-400">
                    Please type {confirmation} exactly as shown.
                </p>
            )}

            {isValid && (
                <p className="mt-1.5 text-xs text-green-400">
                    Confirmation accepted.
                </p>
            )}
        </div>
    );
}