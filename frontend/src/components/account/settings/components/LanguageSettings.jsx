import { Globe2, Languages } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { setLocale } from '../../../../store/slices/localeSlice';
import { LOCALES } from '../../../../utils/locales';

export default function LanguageSettings() {
    const dispatch = useDispatch();
    const language = useSelector((state) => state.locale.current);

    return (
        <section className="rounded-xl border border-marquee-line bg-marquee-bg p-5 sm:p-6">
            <div className="mb-5 flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-marquee-line bg-marquee-panel2 text-marquee-gold">
                    <Languages size={19} />
                </div>
                <div>
                    <h3 className="font-semibold text-marquee-cream">Language</h3>
                    <p className="mt-1 text-sm text-marquee-muted">Select the language used by the application.</p>
                </div>
            </div>

            <label htmlFor="settings-language" className="mb-2 block text-xs font-medium text-marquee-muted">
                Display language
            </label>
            <div className="relative max-w-md">
                <Globe2 size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-marquee-muted" />
                <select
                    id="settings-language"
                    value={language}
                    onChange={(event) => dispatch(setLocale(event.target.value))}
                    className="w-full appearance-none rounded-lg border border-marquee-line bg-marquee-panel2 py-3 pl-10 pr-10 text-sm text-marquee-cream outline-none transition focus:border-marquee-gold focus:ring-2 focus:ring-marquee-gold/20"
                >
                    {LOCALES.map((locale) => (
                        <option key={locale.code} value={locale.code}>{locale.label}</option>
                    ))}
                </select>
                <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-marquee-muted">⌄</span>
            </div>
        </section>
    );
}
