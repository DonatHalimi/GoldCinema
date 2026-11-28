import { Bell, Timer } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import MarqueeSelect from '../../../../components/ui/MarqueeSelect';

const STORAGE_KEY = 'gc-notification-preferences';
const DEFAULT_PREFERENCES = {
    emailNotifications: true,
    inAppAlerts: true,
    frequency: 'instant',
};

const FREQUENCY_OPTION_KEYS = [
    { value: 'instant', labelKey: 'notifications.frequency.instant' },
    { value: 'daily', labelKey: 'notifications.frequency.daily' },
    { value: 'weekly', labelKey: 'notifications.frequency.weekly' },
];

function readPreferences() {
    try {
        const saved = JSON.parse(window.localStorage.getItem(STORAGE_KEY) || 'null');
        return { ...DEFAULT_PREFERENCES, ...(saved || {}) };
    } catch {
        return { ...DEFAULT_PREFERENCES };
    }
}

function PreferenceRow({ title, description, checked, onChange }) {
    return (
        <div className="flex items-center justify-between gap-4 py-3">
            <div className="min-w-0">
                <p className="text-sm font-medium text-marquee-cream">{title}</p>
                <p className="mt-1 text-xs leading-relaxed text-marquee-muted">
                    {description}
                </p>
            </div>
            <button
                type="button"
                role="switch"
                aria-checked={checked}
                aria-label={title}
                onClick={() => onChange(!checked)}
                className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full border border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-marquee-gold focus-visible:ring-offset-2 focus-visible:ring-offset-marquee-bg ${checked ? 'bg-marquee-gold' : 'bg-marquee-line'
                    }`}
            >
                <span
                    className={`inline-block h-5 w-5 rounded-full bg-white shadow transition-transform ${checked ? 'translate-x-[20px]' : 'translate-x-0'
                        }`}
                />
            </button>
        </div>
    );
}

export default function NotificationSettings() {
    const { t } = useTranslation('settings');
    const [preferences, setPreferences] = useState(readPreferences);

    useEffect(() => {
        try {
            window.localStorage.setItem(STORAGE_KEY, JSON.stringify(preferences));
        } catch (error) {
            console.error('[NotificationSettings] Could not persist preferences:', error);
        }
    }, [preferences]);

    const updatePreference = (key, value) => {
        setPreferences((current) => ({ ...current, [key]: value }));
    };

    const frequencyOptions = FREQUENCY_OPTION_KEYS.map(({ value, labelKey }) => ({
        value,
        label: t(labelKey),
    }));

    return (
        <section
            id="notifications"
            className="scroll-mt-28 rounded-xl border border-marquee-line bg-marquee-bg p-5 sm:p-6"
        >
            <div className="mb-5 flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-marquee-line bg-marquee-panel2 text-marquee-gold">
                    <Bell size={19} />
                </div>
                <div>
                    <h3 className="font-semibold text-marquee-cream">
                        {t('notifications.title')}
                    </h3>
                    <p className="mt-1 text-sm text-marquee-muted">
                        {t('notifications.description')}
                    </p>
                </div>
            </div>

            <div className="divide-y divide-marquee-line/70">
                <PreferenceRow
                    title={t('notifications.email.title')}
                    description={t('notifications.email.description')}
                    checked={preferences.emailNotifications}
                    onChange={(value) => updatePreference('emailNotifications', value)}
                />
                <PreferenceRow
                    title={t('notifications.inApp.title')}
                    description={t('notifications.inApp.description')}
                    checked={preferences.inAppAlerts}
                    onChange={(value) => updatePreference('inAppAlerts', value)}
                />
            </div>

            <div className="mt-5 border-t border-marquee-line pt-5">
                <label
                    htmlFor="notification-frequency"
                    className="block text-sm font-medium text-marquee-cream"
                >
                    {t('notifications.frequency.label')}
                </label>
                <p className="mt-1 text-xs text-marquee-muted">
                    {t('notifications.frequency.description')}
                </p>
                <MarqueeSelect
                    id="notification-frequency"
                    value={preferences.frequency}
                    options={frequencyOptions}
                    onChange={(next) => updatePreference('frequency', next)}
                    icon={<Timer size={16} />}
                    className="mt-3"
                />
            </div>

            <p className="mt-5 text-xs text-marquee-muted/80">
                {t('notifications.localOnlyNote')}
            </p>
        </section>
    );
}