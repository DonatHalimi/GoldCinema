import { Globe, Languages } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { setLocale } from '../../../../store/slices/localeSlice';
import { LOCALES } from '../../../../utils/locales';
import MarqueeSelect from '../../../../components/ui/MarqueeSelect';

export default function LanguageSettings() {
    const dispatch = useDispatch();
    const language = useSelector((state) => state.locale.current);

    const options = LOCALES.map((locale) => ({
        value: locale.code,
        label: locale.label,
    }));

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

            <MarqueeSelect
                id="settings-language"
                value={language}
                options={options}
                onChange={(next) => dispatch(setLocale(next))}
                icon={<Globe size={16} />}
            />
        </section>
    );
}