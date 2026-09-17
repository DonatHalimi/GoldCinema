import { Globe } from 'lucide-react';
import { useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useClickOutside } from '../../hooks/useClickOutside';
import { setLocale } from '../../store/slices/localeSlice';
import { LOCALES } from '../../utils/locales';

export default function LanguageSwitcher({ mobile = false }) {
    const current = useSelector((state) => state.locale.current);
    const dispatch = useDispatch();
    const [open, setOpen] = useState(false);
    const dropdownRef = useRef(null);

    useClickOutside(dropdownRef, () => setOpen(false), open);

    const currentLabel = LOCALES.find((l) => l.code === current)?.label || 'English';

    return (
        <div ref={dropdownRef} className={`relative ${mobile ? 'w-full' : ''}`}>
            <button
                type="button"
                onClick={() => setOpen((prev) => !prev)}
                aria-haspopup="listbox"
                aria-expanded={open}
                className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm text-marquee-muted transition hover:bg-white/[0.03] hover:text-marquee-gold"
            >
                <Globe size={16} />
                <span>{currentLabel}</span>
            </button>

            {open && (
                <div
                    role="listbox"
                    className={`absolute z-20 mt-2 w-40 overflow-hidden rounded-lg border border-marquee-line bg-marquee-panel2 shadow-xl ${mobile ? 'left-0 right-0' : 'right-0'}`}
                >
                    {LOCALES.map((locale) => (
                        <button
                            key={locale.code}
                            type="button"
                            role="option"
                            aria-selected={locale.code === current}
                            onClick={() => {
                                dispatch(setLocale(locale.code));
                                setOpen(false);
                            }}
                            className={`flex w-full items-center px-3 py-2.5 text-left text-sm transition ${locale.code === current
                                ? 'bg-marquee-gold/10 text-marquee-gold'
                                : 'text-marquee-cream hover:bg-marquee-line/30'
                                }`}
                        >
                            {locale.label}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}