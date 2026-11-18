import { Check, ChevronDown } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

export default function MarqueeSelect({
    id,
    value,
    options,
    onChange,
    icon = null,
    className = '',
    maxWidth = 'max-w-md',
    multiple = false,
    disabled = false,
    selectAll = false,
}) {
    const [open, setOpen] = useState(false);
    const [draftValues, setDraftValues] = useState([]);
    const dropdownRef = useRef(null);

    const selectedValues = multiple ? (Array.isArray(value) ? value : []) : [];
    const current = options.find((o) => o.value === value) ?? options[0];
    const selectedKey = selectedValues.join('\u0000');

    useEffect(() => {
        if (open && multiple) setDraftValues(selectedKey ? selectedKey.split('\u0000') : []);
    }, [open, multiple, selectedKey]);

    useEffect(() => {
        if (!open) return undefined;

        function handleClickOutside(e) {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setOpen(false);
            }
        }
        function handleKey(e) {
            if (e.key === 'Escape') setOpen(false);
        }

        document.addEventListener('mousedown', handleClickOutside);
        document.addEventListener('keydown', handleKey);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('keydown', handleKey);
        };
    }, [open]);

    const handleSelect = (nextValue) => {
        onChange(nextValue);
        setOpen(false);
    };

    const toggleDraftValue = (nextValue) => {
        setDraftValues((currentValues) => currentValues.includes(nextValue)
            ? currentValues.filter((item) => item !== nextValue)
            : [...currentValues, nextValue]);
    };

    return (
        <div ref={dropdownRef} className={`relative ${maxWidth} ${className}`}>
            <button
                id={id}
                type="button"
                disabled={disabled}
                onClick={() => setOpen((prev) => !prev)}
                aria-haspopup="listbox"
                aria-expanded={open}
                className={`flex w-full items-center justify-between gap-3 rounded-lg border bg-marquee-panel2 py-3 text-left text-sm text-marquee-cream outline-none focus:outline-none focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-60 ${icon ? 'pl-10' : 'pl-3'
                    } pr-3 ${open
                        ? 'border-marquee-gold ring-2 ring-marquee-gold/20'
                        : 'border-marquee-line hover:border-marquee-gold/40'
                    }`}
            >
                {icon && (
                    <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-marquee-gold">
                        {icon}
                    </span>
                )}
                <span className="flex items-center gap-2 truncate">
                    {multiple
                        ? `${selectedValues.length} roles selected`
                        : current?.label ?? 'Select an option'}
                </span>
                <ChevronDown size={16} className={`shrink-0 text-marquee-muted transition-transform ${open ? 'rotate-180 text-marquee-gold' : ''}`} />
            </button>

            {open && (
                <ul
                    role="listbox"
                    aria-multiselectable={multiple || undefined}
                    aria-labelledby={id}
                    className="absolute left-0 right-0 z-20 mt-2 max-h-72 overflow-y-auto rounded-lg border border-marquee-line bg-marquee-panel shadow-xl"
                >
                    {multiple && selectAll && (
                        <li role="option" aria-selected={draftValues.length === options.length}>
                            <button
                                type="button"
                                aria-checked={draftValues.length === options.length}
                                onClick={() => setDraftValues(
                                    draftValues.length === options.length ? [] : options.map((option) => option.value)
                                )}
                                className="flex w-full items-center gap-3 border-b border-marquee-line px-3 py-2.5 text-left text-sm font-semibold text-marquee-cream transition hover:bg-marquee-panel2"
                            >
                                <span className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border ${draftValues.length === options.length
                                    ? 'border-marquee-gold bg-marquee-gold text-marquee-bg'
                                    : 'border-marquee-line'}`}>
                                    {draftValues.length === options.length && <Check size={12} strokeWidth={3} />}
                                </span>
                                Select all roles
                            </button>
                        </li>
                    )}
                    {options.map((option) => {
                        const isActive = multiple
                            ? (open ? draftValues : selectedValues).includes(option.value)
                            : option.value === value;
                        return (
                            <li key={option.value} role="option" aria-selected={isActive}>
                                <button
                                    type="button"
                                    onClick={() => multiple ? toggleDraftValue(option.value) : handleSelect(option.value)}
                                    className={`flex w-full items-center gap-3 px-3 py-2.5 text-left text-sm transition ${isActive
                                        ? 'bg-marquee-gold/10 text-marquee-goldBright'
                                        : 'text-marquee-cream hover:bg-marquee-panel2 hover:text-marquee-gold'}`}
                                >
                                    {multiple && (
                                        <span className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border ${isActive
                                            ? 'border-marquee-gold bg-marquee-gold text-marquee-bg'
                                            : 'border-marquee-line'}`}>
                                            {isActive && <Check size={12} strokeWidth={3} />}
                                        </span>
                                    )}
                                    <span className="truncate">{option.label}</span>
                                    {!multiple && isActive && (
                                        <Check size={15} className="shrink-0 text-marquee-gold" />
                                    )}
                                </button>
                            </li>
                        );
                    })}
                    {multiple && (
                        <li className="sticky bottom-0 border-t border-marquee-line bg-marquee-panel p-2">
                            <button
                                type="button"
                                onClick={() => {
                                    onChange(draftValues);
                                    setOpen(false);
                                }}
                                className="w-full rounded-md bg-marquee-gold px-3 py-2 text-sm font-semibold text-marquee-bg transition hover:brightness-110"
                            >
                                Apply roles
                            </button>
                        </li>
                    )}
                </ul>
            )}
        </div>
    );
}