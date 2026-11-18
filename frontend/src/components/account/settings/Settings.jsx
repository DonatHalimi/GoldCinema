import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import AppearanceSettings from './components/AppearanceSettings';
import LanguageSettings from './components/LanguageSettings';
import NotificationSettings from './components/NotificationSettings';

export default function Settings() {
    const location = useLocation();

    useEffect(() => {
        if (location.hash !== '#notifications') return undefined;

        const frame = window.requestAnimationFrame(() => {
            document.getElementById('notifications')?.scrollIntoView({
                behavior: 'smooth',
                block: 'start',
            });
        });

        return () => window.cancelAnimationFrame(frame);
    }, [location.hash]);

    return (
        <div className="space-y-7">
            <header className="border-b border-marquee-line pb-6">
                <h2 className="font-display text-2xl font-semibold tracking-wide text-marquee-goldBright">
                    Settings
                </h2>
                <p className="mt-2 max-w-2xl text-sm leading-relaxed text-marquee-muted">
                    Personalize your experience, set your language, and choose frequency of your notifications
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