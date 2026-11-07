import { Check, Moon, Palette, Sun } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { setTheme } from '../../../../store/slices/themeSlice';

const THEMES = [
    { id: 'dark', label: 'Dark theme', description: 'The cinematic dark experience', Icon: Moon },
    { id: 'light', label: 'Light theme', description: 'A brighter interface for daytime viewing', Icon: Sun },
];

export default function AppearanceSettings() {
    const dispatch = useDispatch();
    const theme = useSelector((state) => state.theme.mode);

    return (
        <section className="rounded-xl border border-marquee-line bg-marquee-bg p-5 sm:p-6">
            <div className="mb-5 flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-marquee-line bg-marquee-panel2 text-marquee-gold">
                    <Palette size={19} />
                </div>
                <div>
                    <h3 className="font-semibold text-marquee-cream">Appearance</h3>
                    <p className="mt-1 text-sm text-marquee-muted">Choose the visual theme used throughout GoldCinema.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {THEMES.map(({ id, label, description, Icon }) => {
                    const active = theme === id;

                    return (
                        <button
                            key={id}
                            type="button"
                            onClick={() => dispatch(setTheme(id))}
                            aria-pressed={active}
                            className={`flex items-center gap-3 rounded-lg border p-4 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-marquee-gold ${
                                active
                                    ? 'border-marquee-gold/70 bg-marquee-gold/10'
                                    : 'border-marquee-line bg-marquee-panel2/40 hover:border-marquee-gold/40'
                            }`}
                        >
                            <span className={`flex h-10 w-10 items-center justify-center rounded-lg ${
                                active ? 'bg-marquee-gold/15 text-marquee-gold' : 'bg-marquee-line/40 text-marquee-muted'
                            }`}>
                                <Icon size={19} />
                            </span>
                            <span className="min-w-0 flex-1">
                                <span className="block text-sm font-semibold text-marquee-cream">{label}</span>
                                <span className="mt-1 block text-xs text-marquee-muted">{description}</span>
                            </span>
                            {active && <Check size={17} className="shrink-0 text-marquee-gold" />}
                        </button>
                    );
                })}
            </div>
        </section>
    );
}
