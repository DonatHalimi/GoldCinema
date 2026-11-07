import { useEffect } from 'react';
import { Settings as SettingsIcon } from 'lucide-react';
import AppearanceSettings from './components/AppearanceSettings';
import LanguageSettings from './components/LanguageSettings';
import NotificationSettings from './components/NotificationSettings';

export default function Settings() {
    useEffect(() => {
        if (window.location.hash !== '#notifications') return undefined;

        const scrollToNotifications = () => {
            document.getElementById('notifications')?.scrollIntoView({
                behavior: 'smooth',
                block: 'start',
            });
        };

        const frame = window.requestAnimationFrame(scrollToNotifications);
        return () => window.cancelAnimationFrame(frame);
    }, []);

    return (
        <div className="space-y-7">
            <header className="border-b border-marquee-line pb-6">
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-marquee-goldDim">
                    <SettingsIcon size={14} />
                    Personal preferences
                </div>
                <h2 className="mt-2 font-display text-3xl font-semibold tracking-wide text-marquee-goldBright sm:text-4xl">
                    Settings
                </h2>
                <p className="mt-2 max-w-2xl text-sm leading-relaxed text-marquee-muted">
                    Customize your GoldCinema experience, manage your language, and control how you receive updates.
                </p>
            </header>

            <div className="space-y-5">
                <AppearanceSettings />
                <LanguageSettings />
                <NotificationSettings />
            </div>
        </div>
    );
}
