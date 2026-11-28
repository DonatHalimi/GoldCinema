import { Check, Moon, Palette, Sun } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { setTheme } from '../../../../store/slices/themeSlice';

const THEMES = [
    { id: 'dark', labelKey: 'appearance.dark.label', descriptionKey: 'appearance.dark.description', Icon: Moon },
    { id: 'light', labelKey: 'appearance.light.label', descriptionKey: 'appearance.light.description', Icon: Sun },
];

export default function AppearanceSettings() {
    const { t } = useTranslation('settings');
    const dispatch = useDispatch();
    const theme = useSelector((state) => state.theme.mode);

    return (
        <section className="rounded-xl border border-marquee-line bg-marquee-bg p-5 sm:p-6">
            <div className="mb-5 flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-marquee-line bg-marquee-panel2 text-marquee-gold">
                    <Palette size={19} />
                </div>
                <div>
                    <h3 className="font-semibold text-marquee-cream">
                        {t('appearance.title')}
                    </h3>
                    <p className="mt-1 text-sm text-marquee-muted">
                        {t('appearance.description')}
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {THEMES.map(({ id, labelKey, descriptionKey, Icon }) => {
                    const active = theme === id;
                    const label = t(labelKey);
                    const description = t(descriptionKey);

                    return (
                        <button
                            key={id}
                            type="button"
                            onClick={() => dispatch(setTheme(id))}
                            aria-pressed={active}
                            className={`flex items-center gap-3 rounded-lg border p-4 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-marquee-gold ${active
                                    ? 'border-marquee-gold/70 bg-marquee-gold/10'
                                    : 'border-marquee-line bg-marquee-panel2/40 hover:border-marquee-gold/40'
                                }`}
                        >
                            <span
                                className={`flex h-10 w-10 items-center justify-center rounded-lg ${active
                                        ? 'bg-marquee-gold/15 text-marquee-gold'
                                        : 'bg-marquee-line/40 text-marquee-muted'
                                    }`}
                            >
                                <Icon size={19} />
                            </span>
                            <span className="min-w-0 flex-1">
                                <span className="block text-sm font-semibold text-marquee-cream">
                                    {label}
                                </span>
                                <span className="mt-1 block text-xs text-marquee-muted">
                                    {description}
                                </span>
                            </span>
                            {active && (
                                <Check size={17} className="shrink-0 text-marquee-gold" />
                            )}
                        </button>
                    );
                })}
            </div>
        </section>
    );
}
