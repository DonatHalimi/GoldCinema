import i18next from 'i18next';
import { initReactI18next } from 'react-i18next';
import HttpBackend from 'i18next-http-backend';
import LanguageDetector from 'i18next-browser-languagedetector';
import { DEFAULT_LOCALE, SUPPORTED_LOCALE_CODES } from './utils/locales';

i18next
    .use(HttpBackend)
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
        supportedLngs: SUPPORTED_LOCALE_CODES,
        fallbackLng: DEFAULT_LOCALE,
        ns: ['common'],
        defaultNS: 'common',
        backend: {
            loadPath: `${import.meta.env.VITE_API_URL || 'http://localhost:4000/api'}/i18n/{{lng}}/{{ns}}`,
        },
        detection: {
            order: ['localStorage', 'navigator'],
            lookupLocalStorage: 'gc-locale',
            caches: ['localStorage'],
        },
        interpolation: { escapeValue: false },
    });

export default i18next;