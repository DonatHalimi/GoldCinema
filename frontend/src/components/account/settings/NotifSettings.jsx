import { Bell, Check, Globe2, Languages, Moon, Palette, Sun } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setLocale } from '../../../store/slices/localeSlice';
import { setTheme } from '../../../store/slices/themeSlice';
import { LOCALES } from '../../../utils/locales';

const STORAGE_KEY = 'gc-notification-preferences';

const DEFAULT_PREFERENCES = {
    emailNotifications: true,
    inAppAlerts: true,
    frequency: 'instant',
};

function readPreferences() {
    try {
        const saved = JSON.parse(window.localStorage.getItem(STORAGE_KEY) || 'null');
        return { ...DEFAULT_PREFERENCES, ...(saved || {}) };
    } catch {
        return DEFAULT_PREFERENCES;
    }
}

function SettingsCard({ icon: Icon, title, description, children }) {
    return (
        <section className="rounded-xl border border-marquee-line bg-marquee-bg p-5 sm:p-6">
            <div className="mb-5 flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-marquee-line bg-marquee-panel2 text-marquee-gold">
                    <Icon size={19} />
                </div>
                <div className="min-w-0">
                    <h3 className="font-semibold text-marquee-cream">{title}</h3>
                    <p className="mt-1 text-sm leading-relaxed text-marquee-muted">{description}</p>
                </div>
            </div>
            {children}
        </section>
    );
}

function PreferenceRow({ title, description, checked, onChange, disabled = false }) {
    return (
        <div className="flex items-center justify-between gap-4 py-3">
            <div className="min-w-0">
                <p className="text-sm font-medium text-marquee-cream">{title}</p>
                <p className="mt-1 text-xs leading-relaxed text-marquee-muted">{description}</p>
            </div>
            <button
                type="button"
                role="switch"
                aria-checked={checked}
                aria-label={title}
                disabled={disabled}
                onClick={() => onChange(!checked)}
                className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full border border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-marquee-gold focus-visible:ring-offset-2 focus-visible:ring-offset-marquee-bg disabled:cursor-not-allowed disabled:opacity-50 ${checked ? 'bg-marquee-gold' : 'bg-marquee-line'}`}
            >
                <span
                    className={`inline-block h-5 w-5 rounded-full bg-white shadow transition-transform ${checked ? 'translate-x-[20px]' : 'translate-x-0'}`}
                />
            </button>
        </div>
    );
}

export default function NotifSettings() {
    const dispatch = useDispatch();
    const theme = useSelector((state) => state.theme.mode);
    const language = useSelector((state) => state.locale.current);
    const [preferences, setPreferences] = useState(readPreferences);

    useEffect(() => {
        try {
            window.localStorage.setItem(STORAGE_KEY, JSON.stringify(preferences));
        } catch (error) {
            console.error('[NotifSettings] Could not persist preferences:', error);
        }
    }, [preferences]);

    const updatePreference = (key, value) => {
        setPreferences((current) => ({ ...current, [key]: value }));
    };

    return (
        <div className="space-y-7">
            <header className="border-b border-marquee-line pb-6">
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-marquee-goldDim">
                    <SettingsIcon />
                    Personal preferences
                </div>
                <h2 className="mt-2 font-display text-3xl font-semibold tracking-wide text-marquee-goldBright sm:text-4xl">
                    Settings
                </h2>
                <p className="mt-2 max-w-2xl text-sm leading-relaxed text-marquee-muted">
                    Customize the way GoldCinema looks and how you receive updates.
                    Your preferences are stored locally on this device.
                </p>
            </header>

            <div className="space-y-5">
                <SettingsCard
                    icon={Palette}
                    title="Appearance"
                    description="Choose the visual theme used throughout GoldCinema."
                >
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                        {[
                            { id: 'dark', label: 'Dark theme', detail: 'The cinematic dark experience', Icon: Moon },
                            { id: 'light', label: 'Light theme', detail: 'A brighter, low-contrast interface', Icon: Sun },
                        ].map(({ id, label, detail, Icon }) => {
                            const active = theme === id;
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
                                    <span className={`flex h-10 w-10 items-center justify-center rounded-lg ${active ? 'bg-marquee-gold/15 text-marquee-gold' : 'bg-marquee-line/40 text-marquee-muted'}`}>
                                        <Icon size={19} />
                                    </span>
                                    <span className="min-w-0 flex-1">
                                        <span className="block text-sm font-semibold text-marquee-cream">{label}</span>
                                        <span className="mt-1 block text-xs text-marquee-muted">{detail}</span>
                                    </span>
                                    {active && <Check size={17} className="shrink-0 text-marquee-gold" />}
                                </button>
                            );
                        })}
                    </div>
                </SettingsCard>

                <SettingsCard
                    icon={Languages}
                    title="Language"
                    description="Select the language used by the application."
                >
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
                </SettingsCard>

                <SettingsCard
                    icon={Bell}
                    title="Notifications"
                    description="Choose which notifications you receive and how frequently they are grouped."
                >
                    <div className="divide-y divide-marquee-line/70">
                        <PreferenceRow
                            title="Email notifications"
                            description="Receive account updates, booking confirmations, and important news by email."
                            checked={preferences.emailNotifications}
                            onChange={(value) => updatePreference('emailNotifications', value)}
                        />
                        <PreferenceRow
                            title="In-app alerts"
                            description="Show updates and activity alerts inside GoldCinema."
                            checked={preferences.inAppAlerts}
                            onChange={(value) => updatePreference('inAppAlerts', value)}
                        />
                    </div>

                    <div className="mt-5 border-t border-marquee-line pt-5">
                        <label htmlFor="notification-frequency" className="block text-sm font-medium text-marquee-cream">
                            Notification frequency
                        </label>
                        <p className="mt-1 text-xs text-marquee-muted">
                            Choose how often notification updates should be grouped.
                        </p>
                        <select
                            id="notification-frequency"
                            value={preferences.frequency}
                            onChange={(event) => updatePreference('frequency', event.target.value)}
                            className="mt-3 w-full max-w-md rounded-lg border border-marquee-line bg-marquee-panel2 px-3 py-3 text-sm text-marquee-cream outline-none transition focus:border-marquee-gold focus:ring-2 focus:ring-marquee-gold/20"
                        >
                            <option value="instant">Instant</option>
                            <option value="daily">Daily digest</option>
                            <option value="weekly">Weekly summary</option>
                        </select>
                    </div>
                </SettingsCard>
            </div>

            <p className="text-xs text-marquee-muted/80">
                Changes are saved automatically in this browser. These preferences are not yet synchronized with your GoldCinema account.
            </p>
        </div>
    );
}

function SettingsIcon() {
    return <Palette size={13} aria-hidden="true" />;
}
